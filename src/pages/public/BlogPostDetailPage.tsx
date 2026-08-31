/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { dataService } from '../../lib/supabase';
import { BlogPost } from '../../types';
import Icon from '../../components/Icons';

export function BlogPostDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [similarPosts, setSimilarPosts] = useState<BlogPost[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (slug) {
      const found = dataService.getBlogPostBySlug(slug);
      if (found) {
        setPost(found);
        // fetch similar articles excluding current
        const all = dataService.getBlogPosts();
        setSimilarPosts(all.filter(p => p.id !== found.id).slice(0, 3));
      } else {
        navigate('/blog');
      }
    }
  }, [slug, navigate]);

  if (!post) return <div className="text-center py-20 font-sans text-slate-500">Cargando...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 font-sans">
      <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700">
        <Icon name="ArrowLeft" size={16} /> Volver a artículos
      </Link>

      <article className="space-y-8 bg-white p-6 sm:p-10 rounded-3xl border border-slate-100 shadow-sm">
        <div className="space-y-4">
          <span className="inline-block px-3 py-1 bg-brand-50 text-brand-700 font-bold text-xs rounded-lg uppercase tracking-wider">
            {post.category}
          </span>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>Publicado: {new Date(post.published_at!).toLocaleDateString('es-ES')}</span>
            <span>•</span>
            <span>Equipo Financiero RapiCredito</span>
          </div>
        </div>

        <img
          src={post.cover_image}
          alt={post.title}
          className="w-full h-80 sm:h-96 object-cover rounded-2xl"
        />

        {/* Article content (simple mock parser) */}
        <div className="text-slate-600 text-sm sm:text-base leading-relaxed space-y-6 max-w-none">
          {post.content.split('\n\n').map((paragraph, index) => {
            if (paragraph.startsWith('###')) {
              return (
                <h3 key={index} className="font-display font-semibold text-xl text-slate-900 pt-4 pb-2 border-b border-slate-50">
                  {paragraph.replace('###', '').trim()}
                </h3>
              );
            }
            if (paragraph.startsWith('-')) {
              return (
                <ul key={index} className="list-disc pl-5 space-y-2 text-sm">
                  {paragraph.split('\n').map((li, i) => (
                    <li key={i}>{li.replace('-', '').trim()}</li>
                  ))}
                </ul>
              );
            }
            return <p key={index}>{paragraph}</p>;
          })}
        </div>

        {/* Author Bio Widget */}
        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-slate-50/50 p-6 rounded-2xl">
          <img 
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&h=120&q=80" 
            alt="María Gómez" 
            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
            referrerPolicy="no-referrer"
          />
          <div className="text-center sm:text-left space-y-1">
            <span className="text-slate-800 font-bold text-sm block">María Gómez</span>
            <span className="text-brand-600 text-[10px] font-bold uppercase tracking-wider block">Analista Financiera Principal en RapiCredito</span>
            <p className="text-slate-500 text-xs leading-normal max-w-xl font-medium">
              María cuenta con más de 10 años de experiencia en el sector bancario y microfinanzas. Especializada en modelos de crédito y asesoramiento presupuestario.
            </p>
          </div>
        </div>
      </article>

      {/* Similar Posts */}
      <div className="border-t border-slate-200/60 pt-12 space-y-8">
        <h3 className="font-display font-bold text-2xl text-slate-900">Artículos recomendados</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {similarPosts.map(p => (
            <div key={p.id} className="bg-white rounded-2xl overflow-hidden border border-slate-100 flex flex-col justify-between p-4 shadow-sm hover:shadow-md transition-all">
              <div>
                <img src={p.cover_image} className="h-32 w-full object-cover rounded-xl mb-4" />
                <span className="text-[9px] font-bold text-brand-600 uppercase tracking-widest block mb-1">{p.category}</span>
                <h4 className="font-display font-bold text-sm text-slate-900 line-clamp-2 leading-snug hover:text-brand-600 transition-colors">
                  <Link to={`/blog/${p.slug}`}>{p.title}</Link>
                </h4>
              </div>
              <Link to={`/blog/${p.slug}`} className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 mt-4">
                Leer más <Icon name="ChevronRight" size={12} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
