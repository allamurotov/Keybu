"use client";

import React, { useState, useMemo, useEffect } from "react";
import Pagination from "@/app/components/dashboard/Pagination";
import {
  Search,
  SlidersHorizontal,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  HelpCircle,
} from "lucide-react";
import { baseAPI } from "@/app/lib/utils";

interface Category {
  id: number;
  name: string;
}

export default function CategoriesPage() {
  // ==========================================
  // CATEGORIES STATE
  // ==========================================
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // ==========================================
  // MODALS STATE
  // ==========================================
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);

  const [deletingCategoryId, setDeletingCategoryId] =
    useState<number | null>(null);

  const [newCategoryName, setNewCategoryName] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  // ==========================================
  // GET CATEGORIES
  // GET /api/v1/categories
  // ==========================================
  const getCategories = async () => {
    try {
      setLoading(true);

      const response = await baseAPI.get("/categories");

      console.log("GET CATEGORIES RESPONSE:", response.data);

      setCategories(response.data?.data || []);
    } catch (error: any) {
      console.error("GET CATEGORIES ERROR:", error);

      console.error(
        "API ERROR:",
        error?.response?.data
      );

      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD CATEGORIES
  // ==========================================
  useEffect(() => {
    getCategories();
  }, []);

  // ==========================================
  // ADD CATEGORY
  // POST /api/v1/categories
  // ==========================================
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      setLoading(true);

      const response = await baseAPI.post("/categories", {
        name: newCategoryName.trim(),
      });

      console.log(
        "CREATE CATEGORY RESPONSE:",
        response.data
      );

      const newCategory = response.data?.data;

      if (newCategory) {
        setCategories((prev) => [
          ...prev,
          newCategory,
        ]);
      }

      setIsAddModalOpen(false);
      setNewCategoryName("");

      setSuccessMessage("Muvaffaqiyatli qo'shildi");
      setIsSuccessModalOpen(true);
    } catch (error: any) {
      console.error(
        "CREATE CATEGORY ERROR:",
        error
      );

      console.error(
        "API ERROR:",
        error?.response?.data
      );

      setSuccessMessage(
        error?.response?.data?.message ||
          "Kategoriya qo'shishda xatolik yuz berdi"
      );

      setIsSuccessModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // UPDATE CATEGORY
  // PUT /api/v1/categories/:id
  //
  // MUHIM:
  // Backendda @Put(":id") bor.
  // Shuning uchun patch EMAS, put ishlatamiz.
  // ==========================================
  const handleEditCategory = async () => {
    if (
      !editingCategory ||
      !editingCategory.name.trim()
    ) {
      return;
    }

    try {
      setLoading(true);

      const response = await baseAPI.put(
        `/categories/${editingCategory.id}`,
        {
          name: editingCategory.name.trim(),
        }
      );

      console.log(
        "UPDATE CATEGORY RESPONSE:",
        response.data
      );

      const updatedCategory =
        response.data?.data;

      if (updatedCategory) {
        setCategories((prev) =>
          prev.map((category) =>
            category.id === editingCategory.id
              ? updatedCategory
              : category
          )
        );
      } else {
        // Agar backend updated objectni qaytarmasa,
        // local state'ni qo'lda yangilaymiz.
        setCategories((prev) =>
          prev.map((category) =>
            category.id === editingCategory.id
              ? {
                  ...category,
                  name: editingCategory.name.trim(),
                }
              : category
          )
        );
      }

      setIsEditModalOpen(false);
      setEditingCategory(null);

      setSuccessMessage(
        "Muvaffaqiyatli tahrirlandi"
      );
      setIsSuccessModalOpen(true);
    } catch (error: any) {
      console.error(
        "UPDATE CATEGORY ERROR:",
        error
      );

      console.error(
        "API ERROR:",
        error?.response?.data
      );

      setSuccessMessage(
        error?.response?.data?.message ||
          "Kategoriyani tahrirlashda xatolik yuz berdi"
      );

      setIsEditModalOpen(false);
      setEditingCategory(null);

      setIsSuccessModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // DELETE CATEGORY
  // DELETE /api/v1/categories/:id
  // ==========================================
  const handleDeleteCategory = async () => {
    if (deletingCategoryId === null) return;

    try {
      setLoading(true);

      const response = await baseAPI.delete(
        `/categories/${deletingCategoryId}`
      );

      console.log(
        "DELETE CATEGORY RESPONSE:",
        response.data
      );

      setCategories((prev) =>
        prev.filter(
          (category) =>
            category.id !== deletingCategoryId
        )
      );

      setIsDeleteModalOpen(false);
      setDeletingCategoryId(null);

      setSuccessMessage(
        "Muvaffaqiyatli o'chirildi"
      );
      setIsSuccessModalOpen(true);
    } catch (error: any) {
      console.error(
        "DELETE CATEGORY ERROR:",
        error
      );

      console.error(
        "API ERROR:",
        error?.response?.data
      );

      const message =
        error?.response?.data?.message ||
        "Kategoriyani o'chirishda xatolik yuz berdi";

      setIsDeleteModalOpen(false);
      setDeletingCategoryId(null);

      setSuccessMessage(message);
      setIsSuccessModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FILTER
  // ==========================================
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) =>
      cat.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  // ==========================================
  // PAGINATION
  // ==========================================
  const totalItems = filteredCategories.length;

  const totalPages = Math.ceil(
    totalItems / itemsPerPage
  );

  const startIndex =
    (currentPage - 1) * itemsPerPage;

  const endIndex = Math.min(
    startIndex + itemsPerPage,
    totalItems
  );

  const currentCategories =
    filteredCategories.slice(
      startIndex,
      endIndex
    );

  // ==========================================
  // XLS
  // ==========================================
  const downloadXLS = () => {
    console.log("Downloading XLS...");
  };

  return (
    <>
      {/* Dashboard Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Breadcrumb & Title */}
        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-1 font-medium">
            Kurslar{" "}
            <span className="mx-1">\</span>{" "}
            Kurs kategoriyalari
          </div>

          <div className="flex justify-between items-center mt-3">
            <h1 className="text-2xl font-bold text-gray-900">
              Kurs kategoriyalari
            </h1>

            <button
              onClick={() =>
                setIsAddModalOpen(true)
              }
              className="bg-[#3366FF] hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
            >
              <Plus size={18} />
              Qo&apos;shish
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
          {/* Table Controls */}
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4 items-center">
            <div className="relative w-full sm:w-[320px]">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Izlash"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all font-medium"
              />

              <button className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                <SlidersHorizontal size={16} />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 font-semibold text-[13px]">
                <tr>
                  <th className="py-4 px-6 w-24">
                    ID
                  </th>

                  <th className="py-4 px-6">
                    Kategoriya nomi
                  </th>

                  <th className="py-4 px-6 w-32 text-center">
                    Amallar
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading &&
                categories.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="py-12 text-center text-gray-500 font-medium"
                    >
                      Yuklanmoqda...
                    </td>
                  </tr>
                ) : currentCategories.length >
                  0 ? (
                  currentCategories.map(
                    (category) => (
                      <tr
                        key={category.id}
                        className="hover:bg-gray-50/50 transition-colors group"
                      >
                        <td className="py-4 px-6 text-gray-600 font-medium">
                          {category.id}
                        </td>

                        <td className="py-4 px-6 font-semibold text-gray-800">
                          {category.name}
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-2">
                            {/* EDIT */}
                            <button
                              onClick={() => {
                                setEditingCategory({
                                  ...category,
                                });
                                setIsEditModalOpen(
                                  true
                                );
                              }}
                              className="p-2 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                              <Pencil
                                size={18}
                              />
                            </button>

                            {/* DELETE */}
                            <button
                              onClick={() => {
                                setDeletingCategoryId(
                                  category.id
                                );
                                setIsDeleteModalOpen(
                                  true
                                );
                              }}
                              className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              <Trash2
                                size={18}
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="py-12 text-center text-gray-500 font-medium"
                    >
                      Ma&apos;lumot topilmadi
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="border-t border-gray-100">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              startIndex={startIndex}
              endIndex={endIndex}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(limit) => {
                setItemsPerPage(limit);
                setCurrentPage(1);
              }}
              onDownloadXLS={downloadXLS}
            />
          </div>
        </div>
      </div>

      {/* ================================
          ADD MODAL
      ================================= */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px] p-4"
          onClick={() =>
            setIsAddModalOpen(false)
          }
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-[440px] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-[17px] font-bold text-gray-900">
                Qo&apos;shish
              </h2>

              <button
                onClick={() =>
                  setIsAddModalOpen(false)
                }
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">
                  Kategoriya nomi
                </label>

                <input
                  type="text"
                  placeholder="Kiriting"
                  value={newCategoryName}
                  onChange={(e) =>
                    setNewCategoryName(
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-medium"
                />
              </div>

              <button
                onClick={handleAddCategory}
                disabled={loading}
                className="bg-[#3366FF] hover:bg-blue-600 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-colors shadow-sm"
              >
                <Check
                  size={18}
                  strokeWidth={2.5}
                />
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================
          EDIT MODAL
      ================================= */}
      {isEditModalOpen &&
        editingCategory && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px] p-4"
            onClick={() =>
              setIsEditModalOpen(false)
            }
          >
            <div
              className="bg-white rounded-2xl shadow-xl w-full max-w-[440px] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-[17px] font-bold text-gray-900">
                  Tahrirlash
                </h2>

                <button
                  onClick={() =>
                    setIsEditModalOpen(false)
                  }
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">
                    Kategoriya nomi
                  </label>

                  <input
                    type="text"
                    placeholder="Kiriting"
                    value={editingCategory.name}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-medium"
                  />
                </div>

                <button
                  onClick={handleEditCategory}
                  disabled={loading}
                  className="bg-[#3366FF] hover:bg-blue-600 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-colors shadow-sm"
                >
                  <Check
                    size={18}
                    strokeWidth={2.5}
                  />
                  Saqlash
                </button>
              </div>
            </div>
          </div>
        )}

      {/* ================================
          DELETE MODAL
      ================================= */}
      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px] p-4"
          onClick={() =>
            setIsDeleteModalOpen(false)
          }
        >
          <div
            className="bg-white rounded-[24px] shadow-xl w-full max-w-[360px] p-8 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="w-16 h-16 bg-[#EF4444] text-white rounded-full flex items-center justify-center mb-5 shadow-[0_8px_16px_rgba(239,68,68,0.25)]">
              <HelpCircle
                size={32}
                strokeWidth={2.5}
              />
            </div>

            <h2 className="text-[17px] font-bold text-gray-900 mb-8">
              Ma&apos;lumotni
              o&apos;chirmoqchimisiz?
            </h2>

            <div className="flex items-center gap-3 w-full justify-center">
              <button
                onClick={() =>
                  setIsDeleteModalOpen(false)
                }
                className="px-5 py-3 text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-sm font-bold transition-colors flex-1"
              >
                Bekor qilish
              </button>

              <button
                onClick={handleDeleteCategory}
                disabled={loading}
                className="px-5 py-3 text-white bg-[#3366FF] hover:bg-blue-600 disabled:opacity-50 rounded-xl text-sm font-bold transition-colors shadow-sm flex-1"
              >
                O&apos;chirish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================
          SUCCESS MODAL
      ================================= */}
      {isSuccessModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px] p-4"
          onClick={() =>
            setIsSuccessModalOpen(false)
          }
        >
          <div
            className="bg-white rounded-[24px] shadow-xl w-full max-w-[360px] p-8 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="w-16 h-16 bg-[#22C55E] text-white rounded-full flex items-center justify-center mb-5 shadow-[0_8px_16px_rgba(34,197,68,0.25)]">
              <Check
                size={36}
                strokeWidth={3}
              />
            </div>

            <h2 className="text-[17px] font-bold text-gray-900 mb-8">
              {successMessage}
            </h2>

            <button
              onClick={() =>
                setIsSuccessModalOpen(false)
              }
              className="bg-[#3366FF] hover:bg-blue-600 text-white px-8 py-3 rounded-xl text-sm font-bold transition-colors shadow-sm min-w-[140px]"
            >
              Yopish
            </button>
          </div>
        </div>
      )}
    </>
  );
}