import TextBox from '../TextBox/TextBox';
import Button from '../Button/Button';
import './HelperPanel.css';

function SearchPanel(){
  return (
    <div className='search-panel-container'>
      <TextBox 
        label='Search'
        placeholder='Find a specific word'
      />

      <Button>
        Search
      </Button>
    </div>
  );
}

function FilterPanel() {
  return 0;
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