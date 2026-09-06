import { useLocation } from "react-router-dom";

function SearchResults() {

    const { state } = useLocation();

    return (

        <div className="mx-auto max-w-7xl p-6">

            <h1 className="mb-6 text-2xl font-semibold">

                Search Results

            </h1>

            <pre className="rounded border bg-gray-100 p-4">

                {JSON.stringify(state, null, 4)}

            </pre>

        </div>

    );

}

export default SearchResults;