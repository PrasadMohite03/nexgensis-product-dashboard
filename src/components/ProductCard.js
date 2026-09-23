import Link from "next/link";

/**
 * Mobile-only product cards. Hidden on desktop via Tailwind.
 * Props:
 *   products — same array passed to ProductTable; no separate fetching
 */
export default function ProductCard({ products }) {
  return (
    // visible on mobile, hidden from md breakpoint upwards
    <div className="block md:hidden space-y-3">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4"
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
          <div className="flex-1 min-w-0">
            <Link
              href={`/products/${product.id}`}
              className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 hover:text-indigo-600 transition-colors block"
            >
              {product.title}
            </Link>


            <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 capitalize">
              {product.category}
            </span>

            <div className="mt-2 flex items-center justify-between gap-2 flex-wrap">
              {/* Price */}
              <span className="text-sm font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </span>

              {/* Rating */}
              <span className="text-xs text-gray-600">
                <span className="text-amber-500">★</span>{" "}
                {product.rating.toFixed(1)}
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
