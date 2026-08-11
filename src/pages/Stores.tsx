import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storesApi, branchesApi } from '../lib/api';
import { Store as StoreIcon, GitBranch, Plus, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import StoreModal from '../components/StoreModal';
import BranchModal from '../components/BranchModal';

export default function StoresPage() {
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState<any>(null);
  
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [activeStoreId, setActiveStoreId] = useState<string | null>(null);

  const qc = useQueryClient();
  const { data: stores, isLoading } = useQuery({ 
    queryKey: ['stores'], 
    queryFn: () => storesApi.list().then(r => r.data) 
  });

  const createStore = useMutation({
    mutationFn: (data: any) => storesApi.create(data).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['stores'] }); setShowStoreModal(false); }
  });

  const updateStore = useMutation({
    mutationFn: (data: any) => storesApi.update(selectedStore.id, data).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['stores'] }); setShowStoreModal(false); }
  });

  const createBranch = useMutation({
    mutationFn: (data: any) => branchesApi.create(data).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['stores'] }); setShowBranchModal(false); }
  });

  const updateBranch = useMutation({
    mutationFn: (data: any) => branchesApi.update(selectedBranch.id, data).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['stores'] }); setShowBranchModal(false); }
  });

  const handleSaveStore = (form: any) => {
    if (selectedStore) updateStore.mutate(form);
    else createStore.mutate(form);
  };

  const handleSaveBranch = (form: any) => {
    if (selectedBranch) updateBranch.mutate(form);
    else createBranch.mutate(form);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Stores & Branches</h1>
          <p className="page-subtitle">Manage your entire retail network</p>
        </div>
        <button onClick={() => { setSelectedStore(null); setShowStoreModal(true); }} className="btn-primary">
          <Plus size={16} /> Add Store
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-10"><span className="spinner w-8 h-8" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            <h3 className="font-semibold text-slate-900 mb-3 px-1">All Stores</h3>
            {stores?.map((store: any) => (
              <div 
                key={store.id} 
                onClick={() => setActiveStoreId(store.id)}
                className={`card p-4 cursor-pointer transition-colors ${activeStoreId === store.id ? 'border-brand-500 bg-brand-50' : 'hover:border-brand-300'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${activeStoreId === store.id ? 'bg-brand-600 text-white' : 'bg-slate-100 text-brand-600'}`}>
                      <StoreIcon size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className={`font-semibold truncate ${activeStoreId === store.id ? 'text-brand-900' : 'text-slate-900'}`}>{store.name}</p>
                      <p className="text-xs text-slate-500 truncate">{store.city || 'No city'} · {store.branches?.length || 0} branches</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className={activeStoreId === store.id ? 'text-brand-600' : 'text-slate-400'} />
                </div>
                <div className="mt-3 flex justify-end">
                  <button onClick={(e) => { e.stopPropagation(); setSelectedStore(store); setShowStoreModal(true); }} className="btn-secondary btn-sm">Edit</button>
                </div>
              </div>
            ))}
            {stores?.length === 0 && (
              <div className="text-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <StoreIcon size={24} className="mx-auto text-slate-400 mb-2" />
                <p className="text-slate-500 text-sm">No stores yet.</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            {activeStoreId ? (
              <div className="card p-5">
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-200">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <GitBranch size={18} className="text-brand-600" />
                    Branches for {stores?.find((s: any) => s.id === activeStoreId)?.name}
                  </h3>
                  <button 
                    onClick={() => { setSelectedBranch(null); setShowBranchModal(true); }} 
                    className="btn-secondary btn-sm"
                  >
                    <Plus size={14} /> Add Branch
                  </button>
                </div>

                <div className="space-y-3">
                  {stores?.find((s: any) => s.id === activeStoreId)?.branches?.map((branch: any) => (
                    <div key={branch.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div>
                        <p className="font-medium text-slate-900">{branch.name}</p>
                        <p className="text-sm text-slate-500 mt-1">{branch.address || 'No address provided'}</p>
                        {branch.phone && <p className="text-xs text-slate-400 mt-1">Phone: {branch.phone}</p>}
                      </div>
                      <button onClick={() => { setSelectedBranch(branch); setShowBranchModal(true); }} className="btn-secondary btn-sm bg-white">Edit</button>
                    </div>
                  ))}
                  {stores?.find((s: any) => s.id === activeStoreId)?.branches?.length === 0 && (
                    <div className="text-center py-8 text-slate-500 text-sm">
                      No branches found for this store.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <StoreIcon size={48} className="mb-4 opacity-20" />
                <p>Select a store to view its branches</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showStoreModal && (
        <StoreModal
          store={selectedStore}
          onClose={() => { setShowStoreModal(false); setSelectedStore(null); }}
          onSave={handleSaveStore}
        />
      )}

      {showBranchModal && (
        <BranchModal
          branch={selectedBranch}
          storeId={activeStoreId}
          onClose={() => { setShowBranchModal(false); setSelectedBranch(null); }}
          onSave={handleSaveBranch}
        />
      )}
    </div>
  );
}
