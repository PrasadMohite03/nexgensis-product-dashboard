import Link from "next/link";

/**
 * Desktop-only product table. Hidden on mobile via Tailwind.
 * Props:
 *   products — array of product objects from useProducts
 *   onEdit   — (product) => void
 *   onDelete — (product) => void
 */
export default function ProductTable({ products, onEdit, onDelete }) {
  return (
    <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200/80 bg-white shadow-xs">
      <table className="w-full table-fixed text-sm">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-200/80">
            <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-[6%]">
              Image
            </th>
            <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-[32%]">
              Title
            </th>
            <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-[18%]">
              Category
            </th>
            <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-[13%]">
              Price
            </th>
            <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-[11%]">
              Rating
            </th>
            <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-[11%]">
              Stock
            </th>
            <th className="px-4 py-3.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider w-[9%]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {products.map((product) => (
            <tr
              key={product.id}
              className="group hover:bg-slate-50/70 transition-colors duration-100"
            >
              {/* Thumbnail */}
              <td className="px-4 py-3.5">
                <Link
                  href={`/products/${product.id}`}
                  className="block w-10 h-10 rounded-lg overflow-hidden ring-1 ring-slate-200 hover:ring-indigo-500 transition-all shrink-0 bg-slate-50"
                >
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.src = "https://placehold.co/40x40?text=?";
                    }}
                  />
                </Link>
              </td>

              {/* Title */}
              <td className="px-5 py-3.5 pr-6">
                <Link
                  href={`/products/${product.id}`}
                  className="group/title font-semibold text-[15px] text-slate-900 hover:text-indigo-600 transition-colors inline-flex items-center gap-1.5 leading-snug focus:outline-none focus-visible:underline max-w-full"
                >
                  <span className="truncate">{product.title}</span>
                  <svg
                    className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover/title:opacity-100 group-hover/title:translate-x-0 transition-all text-indigo-600 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              </td>

              {/* Category */}
              <td className="px-4 py-3.5">
                <span className="inline-flex items-center gap-2 text-sm text-slate-600 capitalize font-medium truncate max-w-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" aria-hidden="true" />
                  <span className="truncate">{product.category}</span>
                </span>
              </td>

              {/* Price */}
              <td className="px-4 py-3.5 text-left">
                <span className="font-semibold text-[15px] text-slate-900 tabular-nums">
                  ${Number(product.price).toFixed(2)}
                </span>
              </td>

              {/* Rating */}
              <td className="px-4 py-3.5 text-left">
                <span className="inline-flex items-center gap-1 text-sm tabular-nums">
                  <span className="text-amber-400 text-sm">★</span>
                  <span className="font-medium text-slate-700">
                    {Number(product.rating || 0).toFixed(1)}
                  </span>
                </span>
              </td>

              {/* Stock */}
              <td className="px-4 py-3.5 text-left">
                <StockIndicator stock={product.stock} />
              </td>

              {/* Actions */}
              <td className="px-4 py-3.5 text-center whitespace-nowrap">
                <div className="flex items-center justify-center gap-1">
                  {/* View Details */}
                  <Link
                    href={`/products/${product.id}`}
                    aria-label="View details"
                    title="View details"
                    className="p-1.5 rounded-md text-[#64748B] hover:text-indigo-600 hover:bg-indigo-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </Link>

                  {/* Edit Product */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit && onEdit(product);
                    }}
                    aria-label="Edit product"
                    title="Edit product"
                    className="p-1.5 rounded-md text-[#64748B] hover:text-indigo-600 hover:bg-indigo-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  {/* Delete Product */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete && onDelete(product);
                    }}
                    aria-label="Delete product"
                    title="Delete product"
                    className="p-1.5 rounded-md text-[#94A3B8] hover:text-red-600 hover:bg-red-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Stock indicator component:
 * Inventory package icon + quantity text.
 * Healthy stock (>10): muted green icon
 * Low stock (1-10): orange icon
 * Zero stock (0): red icon
 */
function StockIndicator({ stock }) {
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
