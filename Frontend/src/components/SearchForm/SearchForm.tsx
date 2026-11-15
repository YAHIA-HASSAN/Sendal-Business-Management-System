
import "./SearchForm.css";
const SearchForm = () => {

  return (
    <div id="search-sec" className="w-1/2 px-3">
      <div id="search-bar">
        <input
          type="text"
          placeholder="عن ماذا تبحث؟"
          autoFocus
        />

      </div>
      <div id="search-result">
       

      </div>
    </div>
  );
};

export default SearchForm;
