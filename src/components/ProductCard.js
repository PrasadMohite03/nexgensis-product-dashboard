import Link from "next/link";

/**
 * Mobile-only product cards. Hidden on desktop via Tailwind.
 * Props:
 *   products — same array passed to ProductTable; no separate fetching
 *   onEdit   — (product) => void
 *   onDelete — (product) => void
 */
export default function ProductCard({ products, onEdit, onDelete }) {
  return (
    <div className="block md:hidden space-y-3">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white rounded-xl border border-slate-200/80 p-4 flex gap-3 shadow-xs hover:shadow-sm transition-shadow duration-150"
        >
          {/* Thumbnail */}
          <Link href={`/products/${product.id}`} className="shrink-0">
            <img
              src={product.thumbnail}
              alt={product.title}
              className="w-16 h-16 object-contain rounded-lg bg-slate-50 ring-1 ring-slate-200"
              onError={(e) => {
                e.target.src = "https://placehold.co/64x64?text=?";
              }}
            />
          </Link>

          {/* Details */}
          <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
            {/* Top row: title + actions */}
            <div className="flex items-start justify-between gap-2">
              <Link
                href={`/products/${product.id}`}
                className="group/title font-semibold text-slate-900 text-[15px] leading-snug line-clamp-2 hover:text-indigo-600 transition-colors flex-1"
              >
                <span>{product.title}</span>
              </Link>

              {/* Action buttons */}
              <div className="flex items-center gap-0.5 shrink-0">
                <Link
                  href={`/products/${product.id}`}
                  aria-label="View details"
                  title="View details"
                  className="p-1.5 rounded-md text-[#64748B] hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </Link>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit && onEdit(product);
                  }}
                  aria-label="Edit product"
                  title="Edit product"
                  className="p-1.5 rounded-md text-[#64748B] hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete && onDelete(product);
                  }}
                  aria-label="Delete product"
                  title="Delete product"
                  className="p-1.5 rounded-md text-[#94A3B8] hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Bottom row: category, price, rating, stock */}
            <div className="flex items-center gap-3 flex-wrap text-sm">
              <span className="inline-flex items-center gap-1.5 text-slate-600 capitalize font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" aria-hidden="true" />
                {product.category}
              </span>
              <span className="font-semibold text-slate-900 tabular-nums text-[15px]">
                ${Number(product.price).toFixed(2)}
              </span>
              <span className="text-slate-700 flex items-center gap-0.5 tabular-nums">
                <span className="text-amber-400">★</span>
                {Number(product.rating || 0).toFixed(1)}
              </span>
              <CardStockIndicator stock={product.stock} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CardStockIndicator({ stock }) {
  const qty = Number(stock || 0);

  let iconColor = "text-emerald-500";
  if (qty === 0) {
    iconColor = "text-red-500";
  } else if (qty <= 10) {
    iconColor = "text-amber-500";
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-[15px] text-slate-800 font-medium tabular-nums">
      <svg
        className={`w-4 h-4 shrink-0 ${iconColor}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
      {qty}
    </span>
  );
}
