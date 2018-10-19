import React from 'react';
import PropTypes from 'prop-types';

export class EditableInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editing: this.props.editing || false,
      displayValue: this.props.display,
      parentDisplayValue: this.props.display
    };
  }

  performChange = () => {
    if (this.props.changeAction) {
      this.props.changeAction(this.state.editingValue).then(()=> {

      }).catch(()=> {
        this.setState({ displayValue: this.state.oldDisplay });
        // reset to old value
      }).finally(()=> {
        this.setState({ editing: false });
      });
    }
  };

  enableEditMode = () => {
    this.setState({ editing: true, oldDisplay: this.state.displayValue, editingValue: this.state.displayValue });
  };

  renderInput = () => {
    return <input type="text" className={this.props.editingStyle} tabIndex={this.props.tabIndex} value={this.state.editingValue}
                  onFocus={(event)=> {
                    this.setState({ displayValue: '' });
                    event.target.select();
                  }}

                  onChange={ event => {
                    this.setState({ editingValue: event.target.value });
                  }}

                  onKeyPress={event => {
                    if (event.key === 'Enter') {
                      this.performChange();
                    }
                  }}

                  onBlur={this.performChange} autoFocus/>;
  };

  renderDisplay = ()=> {
    return <div onFocus={this.enableEditMode} tabIndex={this.props.tabIndex} onClick={this.enableEditMode}>{this.state.displayValue}</div>;
  };

  render() {
    return this.state.editing ? this.renderInput() : this.renderDisplay();
  }

  /**
   * If we receive new props then it's most likely because of some formatting that was applied to a value the user entered.
   * Be sure to reflect that!
   *
   * @param prevProps
   */
  componentDidUpdate(prevProps) {
    if (!this.state.editing && (this.props.display !== this.state.parentDisplayValue || this.state.displayValue === '')) {
      this.setState({ displayValue: this.props.display, parentDisplayValue: this.props.display });
    }
  }
}

EditableInput.propTypes = {
  display: PropTypes.string,
  editingStyle: PropTypes.string,
  changeAction: PropTypes.func
};

export default EditableInput;
