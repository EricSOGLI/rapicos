/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { dataService, mediaService } from '../../lib/supabase';
import { BlogPost } from '../../types';
import Icon from '../../components/Icons';
import ResponsiveTable, { TableColumn } from '../../components/ResponsiveTable';

export function AdminBlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [msg, setMsg] = useState('');

  const refreshPosts = () => {
    setPosts(dataService.getAllBlogPostsAdmin());
  };

  useEffect(() => {
    refreshPosts();
  }, []);

  const handleSelectPost = (post: BlogPost) => {
    setSelectedPost(post);
    setIsCreating(false);
    setTitle(post.title);
    setCategory(post.category);
    setExcerpt(post.excerpt);
    setContent(post.content);
    setCoverImage(post.cover_image);
    setIsPublished(post.is_published);
    setMsg('');
  };

  const handleStartCreate = () => {
    setSelectedPost(null);
    setIsCreating(true);
    setTitle('');
    setCategory('Conseils');
    setExcerpt('');
    setContent('');
    setCoverImage('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80');
    setIsPublished(false);
    setMsg('');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("El título no puede estar vacío.");
      return;
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const postData = {
      title,
      slug,
      category,
      excerpt,
      content,
      cover_image: coverImage,
      is_published: isPublished,
      published_at: isPublished ? new Date().toISOString() : undefined
    };

    if (selectedPost) {
      dataService.saveBlogPost({ ...selectedPost, ...postData });
      setMsg('¡El artículo ha sido actualizado con éxito!');
    } else {
      dataService.saveBlogPost(postData);
      setMsg('¡Nuevo artículo creado con éxito!');
      setIsCreating(false);
      setSelectedPost(null);
    }

    refreshPosts();
    setTimeout(() => setMsg(''), 3000);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("¿Está seguro de que desea eliminar este artículo?")) {
      dataService.deleteBlogPost(id);
      if (selectedPost?.id === id) {
        setSelectedPost(null);
      }
      refreshPosts();
    }
  };

  const handleLocalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploadingImage(true);
    const file = e.target.files[0];

    try {
      const fileName = `blog_cover_${Date.now()}_${file.name}`;
      const uploadedUrl = await mediaService.uploadFile('blog-covers', fileName, file);
      setCoverImage(uploadedUrl);
    } catch (err: any) {
      console.error('Blog image upload error:', err);
      alert(`Error al subir la imagen: ${err.message || 'No se pudo conectar con la base de datos.'}`);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleTogglePublish = (post: BlogPost) => {
    dataService.saveBlogPost({
      ...post,
      is_published: !post.is_published,
      published_at: !post.is_published ? new Date().toISOString() : undefined
    });
    refreshPosts();
  };

  const columns: TableColumn<BlogPost>[] = [
    {
      header: 'Image',
      render: (post) => (
        <img
          src={post.cover_image}
          className="h-10 w-16 object-cover rounded bg-slate-100 border border-slate-100"
          alt={post.title}
        />
      )
    },
    {
      header: "Título del artículo",
      render: (post) => <span className="font-semibold text-slate-900">{post.title}</span>
    },
    {
      header: 'Categoría',
      render: (post) => <span className="font-semibold text-slate-400">{post.category}</span>
    },
    {
      header: 'Estado',
      render: (post) => (
        <button
          onClick={() => handleTogglePublish(post)}
          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${
            post.is_published
              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
          }`}
        >
          {post.is_published ? 'Publicado' : 'Borrador'}
        </button>
      )
    },
    {
      header: 'Acciones',
      className: 'text-right',
      render: (post) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => handleSelectPost(post)}
            className="bg-brand-50 hover:bg-brand-100 text-brand-700 px-3 py-1.5 rounded-xl font-bold text-xs transition-colors"
          >
            Editar
          </button>
          <button
            onClick={() => handleDelete(post.id)}
            className="bg-rose-50 hover:bg-rose-100 text-rose-700 p-1.5 rounded-xl transition-colors"
          >
            <Icon name="Trash" size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 sm:space-y-8 pb-10 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 leading-tight">Gestión del blog</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Cree, edite y publique artículos educativos para sus clientes.</p>
        </div>
        <button
          onClick={handleStartCreate}
          className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors self-start flex items-center gap-1 shadow-sm"
        >
          <Icon name="Plus" size={14} /> Nuevo artículo
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Table representation */}
        <div className="lg:col-span-7">
          <ResponsiveTable
            columns={columns}
            data={posts}
            keyExtractor={(post) => post.id}
            emptyMessage="No hay artículos disponibles."
          />
        </div>

        {/* Create/Edit Form representing right drawer */}
        {(selectedPost || isCreating) && (
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <h3 className="font-display font-bold text-base text-slate-900">
                {selectedPost ? 'Editar artículo' : 'Nuevo artículo'}
              </h3>
              <button
                onClick={() => { setSelectedPost(null); setIsCreating(false); }}
                className="text-slate-400 hover:text-slate-650 p-1"
              >
                <Icon name="X" size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-semibold text-slate-650">
              {/* Título */}
              <div className="space-y-1">
                <label className="block text-slate-500">Título del artículo</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ej. 5 consejos para gestionar tu presupuesto"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-500 text-slate-800"
                />
              </div>

              {/* Categoría */}
              <div className="space-y-1">
                <label className="block text-slate-500">Categoría</label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="ej. Ahorro, Presupuesto, Crédito"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-500 text-slate-800"
                />
              </div>

              {/* Resumen (Excerpt) */}
              <div className="space-y-1">
                <label className="block text-slate-500">Resumen del artículo (vista previa en la lista)</label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Introduzca un breve resumen..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs leading-relaxed focus:outline-none focus:border-brand-500 h-20 text-slate-850"
                />
              </div>

              {/* Contenido (Content) */}
              <div className="space-y-1">
                <label className="block text-slate-500">Contenido del artículo (compatible con Markdown)</label>
                <textarea
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Introduzca el texto completo del artículo..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs leading-relaxed focus:outline-none focus:border-brand-500 h-64 text-slate-850 font-mono"
                />
              </div>

              {/* Imagen de portada */}
              <div className="space-y-2">
                <label className="block text-slate-500">Imagen de portada (subir desde el PC)</label>
                {coverImage && (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-100 aspect-video bg-slate-50 flex items-center justify-center">
                    <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:border-brand-500 transition-all relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLocalImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isUploadingImage}
                  />
                  <div className="space-y-1">
                    <div className="h-8 w-8 bg-slate-50 rounded-lg flex items-center justify-center mx-auto text-slate-400">
                      <Icon name="UploadCloud" size={18} />
                    </div>
                    <div className="text-[10px] font-semibold text-slate-650">
                      {isUploadingImage ? 'Subiendo...' : 'Seleccione una imagen de su ordenador'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Publicar */}
              <label className="flex items-center gap-2 cursor-pointer select-none py-1">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-200 text-brand-600 focus:ring-brand-500 cursor-pointer"
                />
                <span className="text-slate-700">Publicar el artículo inmediatamente</span>
              </label>

              {msg && (
                <p className="text-xs text-brand-600 bg-brand-50 p-2.5 rounded-xl text-center font-bold">
                  {msg}
                </p>
              )}

              <div className="flex gap-2 pt-2 border-t border-slate-50">
                <button
                  type="button"
                  onClick={() => { setSelectedPost(null); setIsCreating(false); }}
                  className="flex-1 border border-slate-100 hover:bg-slate-50 text-slate-505 py-2.5 rounded-xl font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-xl font-bold transition-colors shadow-sm"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
