import React, { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  CheckCircle2,
  Edit2,
  Eye,
  EyeOff,
  Filter,
  MapPin,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Sparkles,
  Tag,
  Trash2,
} from 'lucide-react';
import { Modal } from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import {
  AVAILABLE_ICONS,
  categoryService,
  renderCategoryIcon,
} from '../../services/categoryService';
import { AirbnbCategory, CategoryIconName } from '../../types/category';

export const CategoriesManagementPage: React.FC = () => {
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();
  const [categories, setCategories] = useState<AirbnbCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AirbnbCategory | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    city: string;
    iconName: CategoryIconName;
    tagline: string;
    displayOrder: number;
    isActive: boolean;
    badge: string;
  }>({
    name: '',
    city: 'Goa',
    iconName: 'Palmtree',
    tagline: '',
    displayOrder: 1,
    isActive: true,
    badge: '',
  });

  const loadCategories = () => {
    const list = categoryService.getCategories();
    setCategories(list);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      city: 'Goa',
      iconName: 'Palmtree',
      tagline: '',
      displayOrder: categories.length + 1,
      isActive: true,
      badge: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cat: AirbnbCategory) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      city: cat.city,
      iconName: (cat.iconName as CategoryIconName) || 'Palmtree',
      tagline: cat.tagline,
      displayOrder: cat.displayOrder,
      isActive: cat.isActive,
      badge: cat.badge || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toastError('Validation Error', 'Please enter a category name');
      return;
    }
    if (!formData.city.trim()) {
      toastError('Validation Error', 'Please enter a target city');
      return;
    }

    if (editingCategory) {
      categoryService.updateCategory(editingCategory.id, {
        name: formData.name.trim(),
        city: formData.city.trim(),
        iconName: formData.iconName,
        tagline: formData.tagline.trim(),
        displayOrder: Number(formData.displayOrder) || 1,
        isActive: formData.isActive,
        badge: formData.badge.trim() || undefined,
      });
      toastSuccess('Category Updated', `"${formData.name}" has been updated successfully.`);
    } else {
      categoryService.addCategory({
        name: formData.name.trim(),
        city: formData.city.trim(),
        iconName: formData.iconName,
        tagline: formData.tagline.trim(),
        displayOrder: Number(formData.displayOrder) || categories.length + 1,
        isActive: formData.isActive,
        badge: formData.badge.trim() || undefined,
      });
      toastSuccess('Category Added', `"${formData.name}" category is now live on the homepage.`);
    }

    setIsModalOpen(false);
    loadCategories();
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" category?`)) {
      categoryService.deleteCategory(id);
      toastInfo('Category Removed', `"${name}" was deleted from homepage exploration tabs.`);
      loadCategories();
    }
  };

  const handleToggleActive = (cat: AirbnbCategory) => {
    const updated = !cat.isActive;
    categoryService.updateCategory(cat.id, { isActive: updated });
    toastSuccess(
      updated ? 'Category Activated' : 'Category Hidden',
      `"${cat.name}" is now ${updated ? 'visible to travelers' : 'hidden from homepage'}.`
    );
    loadCategories();
  };

  const handleMoveOrder = (cat: AirbnbCategory, direction: 'up' | 'down') => {
    const sorted = [...categories].sort((a, b) => a.displayOrder - b.displayOrder);
    const index = sorted.findIndex((c) => c.id === cat.id);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
      const prev = sorted[index - 1];
      const prevOrder = prev.displayOrder;
      prev.displayOrder = cat.displayOrder;
      cat.displayOrder = prevOrder;
    } else if (direction === 'down' && index < sorted.length - 1) {
      const next = sorted[index + 1];
      const nextOrder = next.displayOrder;
      next.displayOrder = cat.displayOrder;
      cat.displayOrder = nextOrder;
    }

    categoryService.saveCategories(sorted);
    loadCategories();
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset categories back to standard default Indian destinations?')) {
      categoryService.resetToDefaults();
      toastInfo('Categories Reset', 'Default exploration tabs restored.');
      loadCategories();
    }
  };

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.tagline && c.tagline.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const activeCount = categories.filter((c) => c.isActive).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">
              Homepage Categories & Exploration Tabs
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dynamically add and configure Airbnb-style category tabs shown on the guest homepage.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetDefaults}
            className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
            title="Reset to default categories"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 hover:scale-102 active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Category</span>
          </button>
        </div>
      </div>

      {/* Live Guest Preview Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Live Guest View Preview
            </span>
            <span className="text-[11px] text-slate-500">
              ({activeCount} active categories visible on homepage)
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Updates in real-time
          </span>
        </div>

        <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-200/60 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-8 py-2 min-w-max">
            {categories
              .filter((c) => c.isActive)
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((cat, idx) => (
                <div
                  key={cat.id}
                  className="flex flex-col items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity"
                >
                  <div className={idx === 0 ? 'text-rose-600' : 'text-slate-600'}>
                    {renderCategoryIcon(cat.iconName, 'w-5 h-5')}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-800 whitespace-nowrap">
                    {cat.name}
                  </span>
                  {cat.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700">
                      {cat.badge}
                    </span>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search categories by name, city or tagline..."
            className="w-full pl-10 pr-4 py-2 bg-white text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing {filteredCategories.length} of {categories.length} total categories
        </div>
      </div>

      {/* Categories Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((cat) => (
          <div
            key={cat.id}
            className={`bg-white rounded-3xl p-5 border transition-all flex flex-col justify-between space-y-4 ${
              cat.isActive
                ? 'border-slate-200 shadow-xs hover:border-slate-300'
                : 'border-slate-200/60 bg-slate-50/50 opacity-60'
            }`}
          >
            {/* Top Info */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shadow-2xs shrink-0">
                    {renderCategoryIcon(cat.iconName, 'w-6 h-6')}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-bold text-sm text-slate-900">{cat.name}</h3>
                      {cat.badge && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-md">
                          {cat.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                      <MapPin className="w-3 h-3 text-rose-500" />
                      <span>Filters for: <strong className="text-slate-700">{cat.city}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Active Switch */}
                <button
                  type="button"
                  onClick={() => handleToggleActive(cat)}
                  className={`p-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors ${
                    cat.isActive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                  title={cat.isActive ? 'Click to deactivate' : 'Click to activate'}
                >
                  {cat.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{cat.isActive ? 'Active' : 'Hidden'}</span>
                </button>
              </div>

              {/* Tagline */}
              <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                {cat.tagline || 'No tagline specified.'}
              </p>
            </div>

            {/* Bottom Controls */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-slate-500">
                <span className="font-semibold text-slate-400">Order:</span>
                <span className="font-bold text-slate-800 px-2 py-0.5 bg-slate-100 rounded-md">
                  #{cat.displayOrder}
                </span>

                {/* Reorder Arrows */}
                <div className="flex items-center gap-0.5 ml-1">
                  <button
                    onClick={() => handleMoveOrder(cat, 'up')}
                    className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-900"
                    title="Move up"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleMoveOrder(cat, 'down')}
                    className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-900"
                    title="Move down"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(cat)}
                  className="p-2 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Edit category"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(cat.id, cat.name)}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Delete category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Homepage Category' : 'Create New Homepage Category'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category Title *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Royal Palaces, Houseboats, Beachfront"
                required
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Indian Destination / City *
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Jaipur, Goa, Udaipur, Coorg, Manali"
                required
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tagline / Travel Description
            </label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              placeholder="e.g. Romantic heritage stays on shimmering waters"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>

          {/* Visual Icon Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Select Icon ({AVAILABLE_ICONS.length} available)
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
              {AVAILABLE_ICONS.map((item) => {
                const isSelected = formData.iconName === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setFormData({ ...formData, iconName: item.name })}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl text-center transition-all ${
                      isSelected
                        ? 'bg-rose-600 text-white shadow-xs scale-102 font-bold'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/60'
                    }`}
                  >
                    <div className="text-current">
                      {renderCategoryIcon(item.name, 'w-5 h-5')}
                    </div>
                    <span className="text-[10px] truncate max-w-[80px]">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Display Order
              </label>
              <input
                type="number"
                min={1}
                value={formData.displayOrder}
                onChange={(e) =>
                  setFormData({ ...formData, displayOrder: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Badge Tag (Optional)
              </label>
              <input
                type="text"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="e.g. Popular, Trending, Luxury"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-700">Active on Homepage</span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{editingCategory ? 'Update Category' : 'Publish Category to Homepage'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
