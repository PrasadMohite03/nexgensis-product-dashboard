import Link from "next/link";

/**
 * Mobile-only product cards. Hidden on desktop via Tailwind.
 * Props:
 *   products — same array passed to ProductTable; no separate fetching
 */
export default function ProductCard({ products, onEdit, onDelete }) {
  return (
    // visible on mobile, hidden from md breakpoint upwards
    <div className="block md:hidden space-y-3">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4 relative group"
        >
          {/* Thumbnail */}
          <Link href={`/products/${product.id}`} className="shrink-0">
            <img
              src={product.thumbnail}
              alt={product.title}
              className="w-20 h-20 object-contain rounded-lg bg-gray-50 hover:opacity-80 transition-opacity"
              onError={(e) => {
                e.target.src = "https://placehold.co/80x80?text=?";
              }}
            />
          </Link>

          {/* Details */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2">
                <Link
                  href={`/products/${product.id}`}
                  className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 hover:text-indigo-600 transition-colors block flex-1"
                >
                  {product.title}
                </Link>

                {/* Mobile Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit && onEdit(product);
                    }}
                    title="Edit product"
                    className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete && onDelete(product);
                    }}
                    title="Delete product"
                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 capitalize">
                {product.category}
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between gap-2 flex-wrap">
              {/* Price */}
              <span className="text-sm font-bold text-gray-900">
                ${Number(product.price).toFixed(2)}
              </span>

              {/* Rating */}
              <span className="text-xs text-gray-600">
                <span className="text-amber-500">★</span>{" "}
                {Number(product.rating || 0).toFixed(1)}
              </span>

              {/* Stock */}
              <CardStockBadge stock={product.stock} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CardStockBadge({ stock }) {
  let className = "text-xs font-semibold px-2 py-0.5 rounded-full ";

  if (stock === 0) {
    className += "bg-red-100 text-red-700";
  } else if (stock <= 10) {
    className += "bg-amber-100 text-amber-700";
  } else {
    className += "bg-green-100 text-green-700";
  }

  return (
    <span className={className}>
      {stock === 0 ? "Out of stock" : `${stock} left`}
    </span>
  );
}
