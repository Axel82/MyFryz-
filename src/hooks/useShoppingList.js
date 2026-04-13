import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

const SHOPPING_STORAGE_KEY = 'myfryz_shopping_list';

// Helper to safely read JSON from localStorage
const safeJsonParse = (key, fallback) => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
};

export const useShoppingList = (familyId) => {
  const [shoppingList, setShoppingList] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Cloud fetch ---
  const fetchCloudData = async () => {
    if (!supabase || !familyId) return;
    try {
      const { data, error } = await supabase
        .from('shopping_list')
        .select('*')
        .eq('inventory_id', familyId)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      setShoppingList(data || []);
    } catch (err) {
      console.error('Shopping Sync error:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- Initial load & Real-time ---
  useEffect(() => {
    if (familyId && supabase) {
      setLoading(true);
      fetchCloudData();

      const subscription = supabase.channel('shopping_list_changes')
        .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'shopping_list', 
            filter: `inventory_id=eq.${familyId}` 
        }, fetchCloudData)
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    } else {
      // Local-only mode
      setShoppingList(safeJsonParse(SHOPPING_STORAGE_KEY, []));
      setLoading(false);
    }
  }, [familyId]);

  // --- Sync to localStorage when offline ---
  useEffect(() => {
    if (!familyId) {
      localStorage.setItem(SHOPPING_STORAGE_KEY, JSON.stringify(shoppingList));
    }
  }, [shoppingList, familyId]);

  // --- Actions ---
  const addToList = async (name) => {
    if (!name?.trim()) return;
    
    // Check if it already exists locally
    if (shoppingList.some(item => item.name.toLowerCase() === name.toLowerCase())) {
        return;
    }

    const newItem = { 
        id: crypto.randomUUID(), 
        name: name.trim(),
        created_at: new Date().toISOString() 
    };

    setShoppingList(prev => [newItem, ...prev]);

    if (familyId && supabase) {
      const { error } = await supabase.from('shopping_list').insert([{ 
          ...newItem, 
          inventory_id: familyId 
      }]);
      if (error) console.error('addToList error:', error.message);
    }
  };

  const removeFromList = async (id) => {
    setShoppingList(prev => prev.filter(it => it.id !== id));
    if (familyId && supabase) {
      const { error } = await supabase.from('shopping_list').delete().eq('id', id);
      if (error) console.error('removeFromList error:', error.message);
    }
  };

  const clearList = async () => {
    setShoppingList([]);
    if (familyId && supabase) {
      const { error } = await supabase.from('shopping_list').delete().eq('inventory_id', familyId);
      if (error) console.error('clearList error:', error.message);
    }
  };

  return { shoppingList, addToList, removeFromList, clearList, loading };
};
