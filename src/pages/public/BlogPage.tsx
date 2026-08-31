/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dataService } from '../../lib/supabase';
import { BlogPost } from '../../types';
import Icon from '../../components/Icons';

export function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [activeCategory, setActiveCategory] = useState('Todas');

  useEffect(() => {
    setPosts(dataService.getBlogPosts());
  }, []);

  const categories = ['Todas', ...Array.from(new Set(posts.map(p => p.category)))];

  const filteredPosts = activeCategory === 'Todas'
    ? posts
    : posts.filter(p => p.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-accent-700 bg-accent-50 px-4 py-1.5 rounded-full uppercase tracking-widest inline-block">Blog RapiCredito</span>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight">Educación financiera y consejos</h1>
        <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
          Guías prácticas, análisis del mercado financiero y consejos comprobados de nuestros expertos para administrar mejor tu dinero.
        </p>
      </div>

      {/* Categories Filter */}
      <div className="flex flex-wrap justify-center gap-2 border-b border-slate-100 pb-6 font-sans">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeCategory === cat
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of posts */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-16 text-slate-400 font-sans">
          No se encontraron artículos en esta categoría.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 font-sans">
          {filteredPosts.map(post => (
            <article key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-md transition-all duration-300">
              <img
                src={post.cover_image}
                alt={post.title}
                className="h-48 w-full object-cover"
              />
              <div className="p-6 flex flex-col flex-grow justify-between">
                <div>
                  <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider block mb-2">
                    {post.category}
                  </span>
                  <h3 className="font-display font-semibold text-lg text-slate-900 mb-2 leading-snug hover:text-brand-600 transition-colors">
                    <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                  <span className="text-[10px] text-slate-400">
                    {new Date(post.published_at!).toLocaleDateString('es-ES')}
                  </span>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
                  >
                    Leer más <Icon name="ChevronRight" size={14} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
