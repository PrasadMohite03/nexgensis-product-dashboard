import Link from "next/link";

/**
 * Desktop-only product table. Hidden on mobile via Tailwind.
 * Props:
 *   products — array of product objects from useProducts
 */
export default function ProductTable({ products, onEdit, onDelete }) {
  return (
    // hidden on mobile, visible from md breakpoint upwards
    <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-600 w-16">
              Image
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">
              Title
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">
              Category
            </th>
            <th className="px-4 py-3 text-right font-semibold text-gray-600">
              Price
            </th>
            <th className="px-4 py-3 text-right font-semibold text-gray-600">
              Rating
            </th>
            <th className="px-4 py-3 text-center font-semibold text-gray-600">
              Stock
            </th>
            <th className="px-4 py-3 text-right font-semibold text-gray-600">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {products.map((product) => (
            <tr
              key={product.id}
              className="hover:bg-slate-50/80 transition-colors"
            >
              {/* Image */}
              <td className="px-4 py-3">
                <Link href={`/products/${product.id}`} className="block w-12 h-12">
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="w-12 h-12 object-contain rounded-lg bg-gray-50 hover:opacity-80 transition-opacity"
                    onError={(e) => {
                      e.target.src = "https://placehold.co/48x48?text=?";
                    }}
                  />
                </Link>
              </td>

              {/* Title */}
              <td className="px-4 py-3 font-medium text-gray-900 max-w-xs">
                <Link
                  href={`/products/${product.id}`}
                  className="hover:text-indigo-600 hover:underline transition-colors block truncate"
                >
                  {product.title}
                </Link>
              </td>

              {/* Category */}
              <td className="px-4 py-3">
                <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 capitalize">
                  {product.category}
                </span>
              </td>

              {/* Price */}
              <td className="px-4 py-3 text-right font-medium text-gray-900">
                ${Number(product.price).toFixed(2)}
              </td>

              {/* Rating */}
              <td className="px-4 py-3 text-right text-gray-700">
                <span className="text-amber-500">★</span>{" "}
                {Number(product.rating || 0).toFixed(1)}
              </td>

              {/* Stock badge */}
              <td className="px-4 py-3 text-center">
                <StockBadge stock={product.stock} />
              </td>

              {/* Actions */}
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit && onEdit(product);
                    }}
                    title="Edit product"
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
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
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StockBadge({ stock }) {
  let className = "inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ";

  if (stock === 0) {
    className += "bg-red-100 text-red-700";
  } else if (stock <= 10) {
    className += "bg-amber-100 text-amber-700";
  } else {
    className += "bg-green-100 text-green-700";
  }

  return <span className={className}>{stock === 0 ? "Out of stock" : `${stock} left`}</span>;
}
