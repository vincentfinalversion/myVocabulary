import TextBox from '../TextBox/TextBox';
import Button from '../Button/Button';
import './HelperPanel.css';

function SearchPanel(){
  return (
    <div className='search-panel-container'>
      <label className='search-panel-label'>
        Search
      </label>

      <TextBox 
        label='Find a specific word'
        placeholder='Enter a word'
      />

      <Button>
        Search
      </Button>
    </div>
  );
}

function FilterPanel() {
  return (
    <div className='filter-panel-container'>
      <label className='filter-panel-label'>
        Filters
      </label>

      <div className='filter-textbox-container'>
        <TextBox
          label='Filter by starting letter'
          placeholder='Enter a letter'
        />
        <TextBox
          label='Filter by character count'
          placeholder='Enter character amount'
        />
      </div>

      <div className='filter-button-container'>
        <Button
          variant='destructive'
        >
          Clear Filters
        </Button>
        <Button>
          Apply Filters
        </Button>
      </div>
    </div>
  );
}

function HelperPanel() {
  return (
    <div className='helper-panel-container'>
      <SearchPanel />
      <FilterPanel />
    </div>
  );
}

export default HelperPanel;