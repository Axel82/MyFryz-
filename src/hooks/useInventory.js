import { useState, useEffect } from 'react';
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

// Helper to safely read JSON from localStorage without crashing
const safeJsonParse = (key, fallback) => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
};

export const useInventory = () => {
  const [items, setItems] = useState([]);
  const [drawers, setDrawers] = useState([]);
  const [familyId, setFamilyId] = useState(() => localStorage.getItem(FAMILY_ID_KEY));
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState(null);

  // --- Cloud fetch ---
  const fetchCloudData = async () => {
    if (!supabase) return;
    setLoading(true);
    setSyncError(null);
    try {
      const [itemsRes, drawersRes] = await Promise.all([
        supabase.from('items').select('*').eq('inventory_id', familyId).order('created_at', { ascending: false }),
        supabase.from('drawers').select('*').eq('inventory_id', familyId).order('name', { ascending: true })
      ]);

      if (itemsRes.error) throw new Error(itemsRes.error.message);
      if (drawersRes.error) throw new Error(drawersRes.error.message);

      setItems(itemsRes.data || []);
      setDrawers(drawersRes.data || []);
    } catch (err) {
      console.error('Sync error:', err);
      setSyncError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Initial load ---
  useEffect(() => {
    if (familyId && supabase) {
      fetchCloudData();

      const subItems = supabase.channel('items_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'items', filter: `inventory_id=eq.${familyId}` }, fetchCloudData)
        .subscribe();

      const subDrawers = supabase.channel('drawers_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'drawers', filter: `inventory_id=eq.${familyId}` }, fetchCloudData)
        .subscribe();

      return () => {
        supabase.removeChannel(subItems);
        supabase.removeChannel(subDrawers);
      };
    } else {
      // Local-only mode
      setItems(safeJsonParse(LOCAL_STORAGE_KEY, []));
      setDrawers(safeJsonParse(DRAWERS_STORAGE_KEY, [{ name: 'Tiroir 1', id: 'default' }]));
      setLoading(false);
    }
  }, [familyId]);

  // --- Sync to localStorage when offline ---
  useEffect(() => {
    if (!familyId) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
      localStorage.setItem(DRAWERS_STORAGE_KEY, JSON.stringify(drawers));
    }
  }, [items, drawers, familyId]);

  // --- CRUD helpers ---
  const addItem = async (item) => {
    const newItem = { ...item, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setItems(prev => [newItem, ...prev]);
    if (familyId && supabase) {
      const { error } = await supabase.from('items').insert([{ ...item, inventory_id: familyId }]);
      if (error) console.error('addItem error:', error.message);
    }
  };

  const updateItem = async (id, updates) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, ...updates } : it));
    if (familyId && supabase) {
      const { error } = await supabase.from('items').update(updates).eq('id', id);
      if (error) console.error('updateItem error:', error.message);
    }
  };

  const deleteItem = async (id) => {
    setItems(prev => prev.filter(it => it.id !== id));
    if (familyId && supabase) {
      const { error } = await supabase.from('items').delete().eq('id', id);
      if (error) console.error('deleteItem error:', error.message);
    }
  };

  const addDrawer = async (name) => {
    if (familyId && supabase) {
      const { data, error } = await supabase.from('drawers').insert([{ name, inventory_id: familyId }]).select().single();
      if (error) {
        console.error('addDrawer error:', error.message);
      } else if (data) {
        setDrawers(prev => [...prev, data]);
      }
    } else {
      setDrawers(prev => [...prev, { name, id: crypto.randomUUID() }]);
    }
  };

  const deleteDrawer = async (name) => {
    if (familyId && supabase) {
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
    if (familyId && supabase) {
      await supabase.from('items').update({ location: newName }).eq('inventory_id', familyId).eq('location', oldName);
      const { error } = await supabase.from('drawers').update({ name: newName }).eq('id', drawerId);
      if (!error) {
        setDrawers(prev => prev.map(dr => dr.id === drawerId ? { ...dr, name: newName } : dr));
        setItems(prev => prev.map(it => it.location === oldName ? { ...it, location: newName } : it));
      }
    } else {
      setDrawers(prev => prev.map(dr => (dr.id === drawerId || dr.name === oldName) ? { ...dr, name: newName } : dr));
      setItems(prev => prev.map(it => it.location === oldName ? { ...it, location: newName } : it));
    }
  };

  const createFamily = async (name = 'Ma Famille') => {
    if (!supabase) {
      console.error('createFamily: Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY secrets.');
      return null;
    }
    try {
      const { data, error } = await supabase.from('inventories').insert([{ name }]).select().single();
      if (error) throw new Error(error.message);

      await supabase.from('drawers').insert([{ name: 'Tiroir 1', inventory_id: data.id }]);

      if (items.length > 0) {
        await supabase.from('items').insert(items.map(it => ({
          name: it.name, category: it.category, location: it.location, quantity: it.quantity, inventory_id: data.id
        })));
      }

      localStorage.setItem(FAMILY_ID_KEY, data.id);
      setFamilyId(data.id);
      return data.id;
    } catch (err) {
      console.error('createFamily error:', err.message);
      return null;
    }
  };

  const joinFamily = (id) => {
    if (!id?.trim()) return;
    localStorage.setItem(FAMILY_ID_KEY, id.trim());
    setFamilyId(id.trim());
  };

  const leaveFamily = () => {
    localStorage.removeItem(FAMILY_ID_KEY);
    setFamilyId(null);
  };

  const getItemSuggestions = async (barcode) => {
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
      if (!response.ok) return null;
      const data = await response.json();
      if (data.status === 1) return { name: data.product.product_name || '', brand: data.product.brands || '' };
      return null;
    } catch {
      return null;
    }
  };

  return { items, drawers, loading, syncError, familyId, addItem, updateItem, deleteItem, addDrawer, deleteDrawer, updateDrawer, createFamily, joinFamily, leaveFamily, getItemSuggestions };
};