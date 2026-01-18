import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError, apiFetch } from "../lib/api";
import { htmlToText, truncateText } from "../lib/richText";
import type { Post, PostVisibility } from "../types/posts";

type PostListResponse = {
  items: Post[];
  total: number;
  page: number;
  limit: number;
};

export function HomePage() {
  const { token, user, initializing } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!token) return;
    void fetchPosts();
  }, [token]);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<PostListResponse>("/posts?limit=100", { token });
      setPosts(data.items);
    } catch (err) {
      setError(resolveErrorMessage(err, "No se pudieron cargar los posts."));
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return posts;
    return posts.filter((post) => {
      const haystack = [
        post.title,
        post.description ?? "",
        post.type ?? "",
        post.category ?? "",
        post.ownerUser?.name ?? "",
        post.ownerUser?.email ?? "",
        post.group?.name ?? "",
        post.tags?.join(" ") ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [posts, searchTerm]);

  const publicPosts = useMemo(
    () => filteredPosts.filter((post) => post.visibility === "PUBLIC"),
    [filteredPosts]
  );
  const userPosts = useMemo(
    () =>
      filteredPosts.filter(
        (post) => post.visibility === "USER" && post.ownerUserId === user?.id
      ),
    [filteredPosts, user?.id]
  );
  const groupPosts = useMemo(
    () => filteredPosts.filter((post) => post.visibility === "GROUP"),
    [filteredPosts]
  );

  if (!token && !initializing) {
    return <Navigate to="/login" replace />;
  }
  if (initializing || !user) {
    return <p className="text-sm text-slate-500">Cargando sesion...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-primary mb-1">Inicio</p>
          <h1 className="text-2xl font-semibold text-slate-900">
            Hola, {user.name || user.email}
          </h1>
          <p className="text-sm text-slate-600">
            Tu muro combina publicaciones publicas, personales y de tus grupos.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void fetchPosts()}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-xl bg-primary text-white font-medium px-4 py-2.5 transition shadow-sm disabled:opacity-60"
        >
          {loading ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <SummaryCard label="Publicos" value={publicPosts.length} />
        <SummaryCard label="Para ti" value={userPosts.length} />
        <SummaryCard label="Grupos" value={groupPosts.length} />
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="w-full md:max-w-md">
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Buscar post
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 bg-white"
            placeholder="Titulo, categoria, tags"
          />
        </div>
        {searchTerm.trim() ? (
          <button
            type="button"
            onClick={() => setSearchTerm("")}
            className="inline-flex justify-center rounded-xl border border-slate-200 text-slate-700 font-medium px-4 py-2 transition shadow-sm"
          >
            Limpiar busqueda
          </button>
        ) : null}
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <PostSection
        title="Publicos"
        subtitle="Publicaciones visibles para todos."
        posts={publicPosts}
        onSelect={(post) => navigate(`/posts/${post.id}`)}
      />
      <PostSection
        title="Para ti"
        subtitle="Publicaciones dirigidas especificamente a tu usuario."
        posts={userPosts}
        onSelect={(post) => navigate(`/posts/${post.id}`)}
      />
      <PostSection
        title="Tus grupos"
        subtitle="Contenido compartido con tus grupos."
        posts={groupPosts}
        onSelect={(post) => navigate(`/posts/${post.id}`)}
      />
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-4 rounded-2xl border border-slate-200 glass-surface">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function PostSection({
  title,
  subtitle,
  posts,
  onSelect,
}: {
  title: string;
  subtitle: string;
  posts: Post[];
  onSelect: (post: Post) => void;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-600">{subtitle}</p>
      </div>
      {posts.length === 0 ? (
        <p className="text-sm text-slate-500">No hay posts para mostrar.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onSelect={onSelect} />
          ))}
        </div>
      )}
    </section>
  );
}

function PostCard({ post, onSelect }: { post: Post; onSelect: (post: Post) => void }) {
  const ownerLabel = post.ownerUser
    ? post.ownerUser.name || post.ownerUser.email
    : post.ownerUserId || "N/A";
  const groupLabel = post.group ? post.group.name : post.groupId || "N/A";
  const descriptionPreview = post.description
    ? truncateText(htmlToText(post.description), 140)
    : null;

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onSelect(post)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(post);
        }
      }}
      className="rounded-2xl border border-slate-200 glass-surface p-4 space-y-3 cursor-pointer transition hover:border-primary/40 hover:shadow-sm"
    >
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wide">
          {resolveVisibilityLabel(post.visibility)}
        </p>
        <h3 className="text-lg font-semibold text-slate-900">{post.title}</h3>
        {descriptionPreview ? (
          <p className="text-sm text-slate-600">{descriptionPreview}</p>
        ) : (
          <p className="text-sm text-slate-400">Sin descripcion</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-slate-600">
        <span className="rounded-full border border-slate-200 px-2 py-1">
          Tipo: {post.type || "N/A"}
        </span>
        <span className="rounded-full border border-slate-200 px-2 py-1">
          Categoria: {post.category || "N/A"}
        </span>
        <span className="rounded-full border border-slate-200 px-2 py-1">
          Tags: {post.tags?.length ? post.tags.join(", ") : "N/A"}
        </span>
      </div>

      {post.visibility === "USER" ? (
        <p className="text-xs text-slate-600">Destino: {ownerLabel}</p>
      ) : null}
      {post.visibility === "GROUP" ? (
        <p className="text-xs text-slate-600">Grupo: {groupLabel}</p>
      ) : null}

      <p className="text-xs text-slate-500">
        Publicado: {formatDate(post.createdAt)}
      </p>
    </article>
  );
}

function resolveVisibilityLabel(visibility: PostVisibility): string {
  switch (visibility) {
    case "PUBLIC":
      return "Publico";
    case "USER":
      return "Para ti";
    case "GROUP":
      return "Grupo";
    default:
      return "Post";
  }
}

function resolveErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return fallback;
}

function formatDate(value?: string | null): string {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}
