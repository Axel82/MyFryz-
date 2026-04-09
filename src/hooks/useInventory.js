import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';

const LOCAL_STORAGE_KEY = 'myfryz_inventory';
const DRAWERS_STORAGE_KEY = 'myfryz_drawers';
const FAMILY_ID_KEY = 'myfryz_family_id';

export const CATEGORIES = [
  { id: 'viande', name: 'Viande', color: 'var(--cat-viande)' },
  { id: 'poisson', name: 'Poisson', color: 'var(--cat-poisson)' },
  { id: 'légumes', name: 'Légumes', color: 'var(--cat-legumes)' },
  { id: 'plat préparé', name: 'Plat préparé', color: 'var(--cat-plat)' },
  { id: 'glaces', name: 'Glaces', color: 'var(--cat-glaces)' },
  { id: 'autres', name: 'Autres', color: 'var(--cat-autres)' },
];

export const useInventory = () => {
  const [items, setItems] = useState([]);
  const [drawers, setDrawers] = useState([]);
  const [familyId, setFamilyId] = useState(() => localStorage.getItem(FAMILY_ID_KEY));
  const [loading, setLoading] = useState(true);

  // Initial load
  useEffect(() => {
    if (familyId) {
      fetchCloudData();
      const subItems = subscribeToItems();
      const subDrawers = subscribeToDrawers();
      return () => {
        supabase.removeChannel(subItems);
        supabase.removeChannel(subDrawers);
      };
    } else {
      const savedItems = localStorage.getItem(LOCAL_STORAGE_KEY);
      const savedDrawers = localStorage.getItem(DRAWERS_STORAGE_KEY);
      setItems(savedItems ? JSON.parse(savedItems) : []);
      setDrawers(savedDrawers ? JSON.parse(savedDrawers) : [{ name: 'Tiroir 1' }]);
      setLoading(false);
    }
  }, [familyId]);

  // Sync LocalStorage if no familyId
  useEffect(() => {
    if (!familyId) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
      localStorage.setItem(DRAWERS_STORAGE_KEY, JSON.stringify(drawers));
    }
  }, [items, drawers, familyId]);

  const fetchCloudData = async () => {
    setLoading(true);
    try {
      const [itemsRes, drawersRes] = await Promise.all([
        supabase.from('items').select('*').eq('inventory_id', familyId).order('created_at', { ascending: false }),
        supabase.from('drawers').select('*').eq('inventory_id', familyId).order('name', { ascending: true })
      ]);

      if (itemsRes.error) console.error('Error fetching items:', itemsRes.error);
      if (drawersRes.error) console.error('Error fetching drawers:', drawersRes.error);
      
      if (!itemsRes.error) setItems(itemsRes.data || []);
      if (!drawersRes.error) setDrawers(drawersRes.data || []);
    } catch (err) {
      console.error('Unexpected error fetching cloud data:', err);
    }
    setLoading(false);
  };

  const subscribeToItems = () => {
    return supabase.channel('items_changes').on('postgres_changes', { 
      event: '*', schema: 'public', table: 'items', filter: `inventory_id=eq.${familyId}` 
    }, () => fetchCloudData()).subscribe();
  };

  const subscribeToDrawers = () => {
    return supabase.channel('drawers_changes').on('postgres_changes', { 
      event: '*', schema: 'public', table: 'drawers', filter: `inventory_id=eq.${familyId}` 
    }, () => fetchCloudData()).subscribe();
  };

  const addItem = async (item) => {
    const newItem = { ...item, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    if (familyId) {
      setItems(prev => [newItem, ...prev]);
      const { error } = await supabase.from('items').insert([{ ...item, inventory_id: familyId }]);
      if (error) console.error('Error adding item to Supabase:', error);
    } else {
      setItems(prev => [newItem, ...prev]);
    }
  };

  const updateItem = async (id, updates) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, ...updates } : it));
    if (familyId) {
      const { error } = await supabase.from('items').update(updates).eq('id', id);
      if (error) console.error('Error updating item in Supabase:', error);
    }
  };

  const deleteItem = async (id) => {
    setItems(prev => prev.filter(it => it.id !== id));
    if (familyId) {
      const { error } = await supabase.from('items').delete().eq('id', id);
      if (error) console.error('Error deleting item from Supabase:', error);
    }
  };

  const addDrawer = async (name) => {
    if (familyId) {
      const { data, error } = await supabase.from('drawers').insert([{ name, inventory_id: familyId }]).select().single();
      if (error) {
        console.error('Error adding drawer to Supabase:', error);
      } else if (data) {
        setDrawers(prev => [...prev, data]);
      }
    } else {
      setDrawers(prev => [...prev, { name, id: crypto.randomUUID() }]);
    }
  };

  const deleteDrawer = async (name) => {
    if (familyId) {
      await supabase.from('items').delete().eq('inventory_id', familyId).eq('location', name);
      const { error } = await supabase.from('drawers').delete().eq('inventory_id', familyId).eq('name', name);
      if (!error) {
        setDrawers(prev => prev.filter(dr => dr.name !== name));
        setItems(prev => prev.filter(it => it.location !== name));
      }
    } else {
      setItems(prev => prev.filter(it => it.location !== name));
      setDrawers(prev => prev.filter(dr => dr.name !== name));
    }
  };

  const updateDrawer = async (drawerId, newName, oldName) => {
    if (familyId) {
      // Update items first to avoid losing reference if we had FKs (though we don't strictly here)
      await supabase.from('items').update({ location: newName }).eq('inventory_id', familyId).eq('location', oldName);
      const { error } = await supabase.from('drawers').update({ name: newName }).eq('id', drawerId);
      if (!error) {
        setDrawers(prev => prev.map(dr => dr.id === drawerId ? { ...dr, name: newName } : dr));
        setItems(prev => prev.map(it => it.location === oldName ? { ...it, location: newName } : it));
      }
    } else {
      setDrawers(prev => prev.map(dr => dr.id === drawerId || dr.name === oldName ? { ...dr, name: newName } : dr));
      setItems(prev => prev.map(it => it.location === oldName ? { ...it, location: newName } : it));
    }
  };

  const createFamily = async (name = 'Ma Famille') => {
    const { data, error } = await supabase.from('inventories').insert([{ name }]).select().single();
    if (!error && data) {
      // Default drawer
      await supabase.from('drawers').insert([{ name: 'Tiroir 1', inventory_id: data.id }]);
      
      // Migration of local data if any
      if (items.length > 0) {
        await supabase.from('items').insert(items.map(it => ({
          name: it.name, category: it.category, location: it.location, quantity: it.quantity, inventory_id: data.id
        })));
      }
      
      localStorage.setItem(FAMILY_ID_KEY, data.id);
      setFamilyId(data.id);
      return data.id;
    }
    return null;
  };

  const joinFamily = (id) => {
    localStorage.setItem(FAMILY_ID_KEY, id);
    setFamilyId(id);
  };

  const leaveFamily = () => {
    localStorage.removeItem(FAMILY_ID_KEY);
    setFamilyId(null);
  };

  const getItemSuggestions = async (barcode) => {
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
      const data = await response.json();
      if (data.status === 1) return { name: data.product.product_name || '', brand: data.product.brands || '' };
      return null;
    } catch (e) { return null; }
  };

  return { items, drawers, loading, familyId, addItem, updateItem, deleteItem, addDrawer, deleteDrawer, updateDrawer, createFamily, joinFamily, leaveFamily, getItemSuggestions };
};
