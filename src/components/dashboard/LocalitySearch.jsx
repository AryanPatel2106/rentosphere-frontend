import { useState, useEffect, useRef } from "react";
import api from "../../services/api";

function LocalitySearch({ selected, setSelected, singleSelect = false }) {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const cache = useRef({});
    const containerRef = useRef(null);

    // Debounce
    useEffect(() => {

        if (!query.trim()) {

            setSuggestions([]);
            return;

        }

        const timer = setTimeout(async () => {

            const key = query.toLowerCase();

            if (cache.current[key]) {

                setSuggestions(cache.current[key]);
                setShowDropdown(true);

                return;

            }

            try {

                setLoading(true);

                const res = await api.get(
                    `/location/autocomplete?q=${encodeURIComponent(query)}`
                );

                cache.current[key] = res.data.data;

                setSuggestions(res.data.data);

                setShowDropdown(true);

            }

            catch (err) {

                console.error(err);

            }

            finally {

                setLoading(false);

            }

        }, 300);

        return () => clearTimeout(timer);

    }, [query]);

    // Close dropdown on outside click
    useEffect(() => {

        function handleClickOutside(event) {

            if (
                containerRef.current &&
                !containerRef.current.contains(event.target)
            ) {

                setShowDropdown(false);

            }

        }

        document.addEventListener("mousedown", handleClickOutside);

        return () =>
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );

    }, []);

    const addLocality = (place) => {
        if (singleSelect) {
            setSelected([place]);
            setQuery(place.label || place.text || "");
        } else {
            const exists = selected.some(
                (item) => item.placeId === place.placeId
            );

            if (exists) return;

            setSelected([...selected, place]);
            setQuery("");
        }

        setSuggestions([]);
        setShowDropdown(false);
    };

    const removeLocality = (placeId) => {
        setSelected(
            selected.filter(
                (item) => item.placeId !== placeId
            )
        );
    };

    const clearLocality = () => {
        setSelected([]);
        setQuery("");
        setSuggestions([]);
        setShowDropdown(false);
    };

    const displayValue = singleSelect
        ? selected[0]?.label || selected[0]?.text || query
        : query;

    return (
        <div
            ref={containerRef}
            className="relative flex-1"
        >
            {singleSelect ? (
                <div className="flex min-h-[48px] items-center gap-2 px-3">
                    {selected.length > 0 ? (
                        <div className="flex flex-1 flex-col justify-center py-2 text-left">
                            <span className="text-[15px] font-medium text-gray-700">
                                {selected[0].label || selected[0].text}
                            </span>
                            <span className="text-xs text-gray-500">
                                {selected[0].text}
                            </span>
                        </div>
                    ) : (
                        <input
                            value={displayValue}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                if (selected.length) {
                                    setSelected([]);
                                }
                            }}
                            onFocus={() => {
                                if (suggestions.length) setShowDropdown(true);
                            }}
                            placeholder="Search locality, landmark, or area (e.g. Koramangala, Whitefield)..."
                            className="min-w-[180px] flex-1 py-2 text-sm text-gray-700 outline-none"
                        />
                    )}

                    {selected.length > 0 && (
                        <button
                            type="button"
                            onClick={clearLocality}
                            className="text-sm text-gray-500 hover:text-gray-700"
                        >
                            Clear
                        </button>
                    )}
                </div>
            ) : (
                <div className="flex min-h-[48px] flex-wrap items-center gap-2 px-3">
                    {selected.map((item) => (
                        <div
                            key={item.placeId}
                            className="flex items-center gap-1 bg-[#009587] px-3 py-1 text-sm text-white"
                        >
                            {item.label}

                            <button
                                type="button"
                                onClick={() => removeLocality(item.placeId)}
                            >
                                ×
                            </button>
                        </div>
                    ))}

                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => {
                            if (suggestions.length) setShowDropdown(true);
                        }}
                        placeholder="Search locality, landmark, or sector (e.g. Koramangala, Whitefield)..."
                        className="min-w-[200px] flex-1 py-2 text-sm outline-none"
                    />
                </div>
            )}

            {showDropdown && (

                <div className="absolute left-0 right-0 top-full z-50 max-h-72 overflow-y-auto border bg-white shadow">

                    {loading && (

                        <div className="p-3 text-sm text-gray-500">

                            Loading...

                        </div>

                    )}

                    {!loading &&
                        suggestions.length === 0 && (

                            <div className="p-3 text-sm text-gray-500">

                                No locations found

                            </div>

                        )}

                    {!loading &&
                        suggestions.map((item) => (

                            <button
                                key={item.placeId}
                                onClick={() =>
                                    addLocality(item)
                                }
                                className="block w-full border-b px-4 py-3 text-left hover:bg-gray-100"
                            >

                                <div className="text-sm font-medium">

                                    {item.label}

                                </div>

                                <div className="text-xs text-gray-500">

                                    {item.text}

                                </div>

                            </button>

                        ))}

                </div>

            )}

        </div>
    );
}

export default LocalitySearch;