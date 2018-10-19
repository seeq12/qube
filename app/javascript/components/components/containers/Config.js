import React from 'react';
import PropTypes from 'prop-types';
import { EMOTIONS, COLORS } from '../../constants/appConstants';
import _ from 'lodash';
import { setTheme, updateEmotion, updateColor } from '../../utils/api.utils';
import { showErrorNotification } from '../../utils/notifications';

/**
 * This component renders the content for the avatar pop-over configuration.
 * It displays the emotions, theme and avatar color selection.
 */
export class Config extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      themes: [],
      customColor: null
    };
    this.setTheme = this.setTheme.bind(this);
    this.selectEmotion = this.selectEmotion.bind(this);
    this.applyCustomColor = this.applyCustomColor.bind(this);
    this.setCustomColor = this.setCustomColor.bind(this);
  }

  selectEmotion(emotion) {
    updateEmotion(emotion, this.props.user.id);
  }

  selectColor(color) {
    if (_.startsWith(color, '#')) {
      color = color.substring(1);
    }

    updateColor(color, this.props.user.id);
  }

  setCustomColor(event) {
    this.setState({ customColor:  event.target.value });
  }

  applyCustomColor() {
    let hex = this.state.customColor;
    if (hex) {
      if (_.startsWith(hex, '#')) {
        hex = hex.substring(1);
      }

      if (hex.length === 6) {
        updateColor(hex, this.props.user.id);
      } else {
        showErrorNotification('Please check the color code you provided.');
      }
    } else {
      showErrorNotification('Please provide a color code.');
    }
  }

  setTheme(event) {
    setTheme(event.target.value, this.props.user.id);
  }

  render() {
    const user = this.props.user;
    const groupedEmotions = _.chunk(EMOTIONS, 6);
    const groupedColors = _.chunk(COLORS, 6);
    const themes = this.props.themes;
    const optionItems = _.map(themes, (theme) => {
      return <option key={theme.theme_name} value={theme.theme_name}>{theme.display_name}</option>;
    });

    return <div className="flexRowContainer">
      { _.map(groupedEmotions, (emotionGroup, idx) => {
        return <div className="flexColumnContainer flexCenter" key={`wrapper${idx}`}>
            {_.map(emotionGroup, (emotion, i)=> {
              return <span className="emotionPopOver cursorPointer" onClick={()=>this.selectEmotion(emotion)} key={`${emotion}_${i}`}>
                { emotion === 'NONE' && <div className="noEmotionPlaceholder" key={`d_none`}></div> }
                { emotion !== 'NONE' && <i className={`flaticon fi ${emotion}`} key={`d_${emotion}`}></i>}
                </span>; })}
      </div>;
      })}

      { _.map(groupedColors, (colorGroup, idx) => {
        return <div className="flexColumnContainer flexCenter" key={`colorgroup_${idx}`}>
          { _.map(colorGroup, (color) => {
            const style = { backgroundColor: color };
            return <div className="colorSwatch cursorPointer" key={color} style={style} onClick={()=> this.selectColor(color)}></div>;
          })
          }
          </div>; })}

      <div className="flexRowContainer flexCenter">
        <span className="smallLabel blackText">Or enter a Hex Code ...</span>
        <div className="flexColumnContainer input-group width-150 mr55">
          <input type="text" className="form-control"
                 placeholder="#ccffcc" defaultValue={_.get(user, 'color')}
                 id="customColor"
                 onChange={this.setCustomColor}/>
            <div className="input-group-btn">
              <button type="button" className="btn btn-default" onClick={this.applyCustomColor}>Apply</button>
            </div>
        </div>
      </div>
      <div className="flexRowContainer">
        <span className="pt15 blackText"><b>Theme</b></span>
        <select className="border" value={_.get(this.props.user, 'theme')} id="themeSelect" onChange={this.setTheme}>
          {optionItems}
        </select>
      </div>
    </div>;
  }
}

Config.propTypes = {
  user: PropTypes.object,
  themes: PropTypes.array
};

export default Config;
