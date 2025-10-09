export default function TeamComponent({
  name,
  description,
  tickers,
}: {
  name: string;
  description: string;
  tickers: string[];
}) {
  return (
    <div className="p-6 max-w-3xl mx-auto text-white">
      <h1 className="text-5xl font-bold mb-2 uppercase tracking-wide">{name}</h1>
      <p className="text-lg text-gray-300 mb-6">{description}</p>

      <h2 className="text-2xl font-semibold mb-2">Tickers</h2>
      <ul className="list-disc list-inside space-y-1">
        {tickers.map((ticker) => (
          <li key={ticker} className="text-lg">
            {ticker}
          </li>
        ))}
      </ul>
    </div>
  );
}