import { WEATHER_THEME } from '../constants/appConstants';
import { fetchWeather } from './api.utils';

let appliedTheme;
let currentCondition;

export function replayCondition() {
  if (currentCondition) {
    manageCondition(currentCondition);
  }
}

export function addCss(theme, availableThemes) {
  let assignedTheme = _.find(availableThemes, { 'theme_name': theme });

  if (!assignedTheme) {
    assignedTheme = _.find(availableThemes, { 'theme_name': 'default' });
  }

  if (theme === WEATHER_THEME) {
    // fetch the current conditions and display weather accordingly:
    fetchWeather().then(function(response) {
      const temp = response.data.temperature;
      const sunset = response.data.sunset;
      let condition = response.data.condition;
      let itsNight = false;
      let theme;

      if (sunset) {
        itsNight = moment(sunset).isAfter(moment().utc(), 'day');
      } else {
        itsNight = moment({ hour: 20 }).isBefore(moment());
      }

      if (itsNight) {
        condition = 'stars';
        theme = 'darkKnight';
      } else if (temp < 11) {
        theme = 'icePrincess';
      } else if (temp >= 11 && temp < 19) {
        theme = 'fallingLeafs';
      } else if (temp >= 19 && temp < 24) {
        theme = 'springFling';
      } else {
        theme = 'popsicle';
      }

      addToDOM(_.find(availableThemes, { 'theme_name': theme }));
      manageCondition(condition);
    });
  } else {
    addToDOM(assignedTheme);
  }
}

function addToDOM(themeDef) {
  if (appliedTheme !== themeDef.theme_name) {
    removeCss(appliedTheme);
    appliedTheme = themeDef.theme_name;
    const link = document.createElement('link');
    link.href = themeDef.css_file;
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.id = 'theme_' + themeDef.theme_name;
    document.getElementsByTagName('head')[0].appendChild(link);
  }
}

function manageCondition(condition) {
  currentCondition = condition;
  if (condition === 'CLOUDY') {
    jQuery('#cloudContainer').fadeIn(1000);
    setTimeout(() => {
      jQuery('#cloudContainer').fadeOut(5000);
    }, 1000 * 60 * 2);
  } else if (condition === 'RAIN') {
    makeItRain();
    setTimeout(() => {
      jQuery('.rain').fadeOut(9000, function() {
        jQuery('.rain').empty();
      });
    }, 1000 * 60 * 2);

  } else if (condition === 'SNOW') {
    jQuery('#snow').fadeIn(5000);
    setTimeout(() => {
      jQuery('#snow').fadeOut(5000);
    }, 1000 * 60 * 2);
  } else if (condition === 'stars') {
    generateStars();
    jQuery('.galaxy').fadeOut(1);
    jQuery('.galaxy').fadeIn(5000);
    setTimeout(() => {
        jQuery('.galaxy').fadeOut(5000, () => {
          jQuery('.galaxy').html('');
        });
      }, 1000 * 60 * 2);
  }
}

function generateStars() {
  var $galaxy = jQuery('.galaxy');
  var iterator = 0;
  while (iterator <= 1000) {
    var xposition = Math.random();
    var yposition = Math.random();
    var starType = Math.floor((Math.random() * 3) + 1);
    var position = {
      'x': $galaxy.width() * xposition,
      'y': 1500 * yposition
    };

    $('<div class="star star-type' + starType + '"></div>').appendTo($galaxy).css({
      'top': position.y,
      'left': position.x
    });

    iterator++;
  }
}

function makeItRain() {
  //clear out everything
  var increment = 0;
  var drops = '';
  var backDrops = '';

  while (increment < 100) {
    //couple random numbers to use for various randomizations
    //random number between 98 and 1
    var randoHundo = (Math.floor(Math.random() * (98 - 1 + 1) + 1));
    //random number between 5 and 2
    var randoFiver = (Math.floor(Math.random() * (5 - 2 + 1) + 2));
    //increment
    increment += randoFiver;
    //add in a new raindrop with various randomizations to certain CSS properties
    drops += '<div class="drop" style="left: ' + increment + '%; bottom: ' + (randoFiver + randoFiver - 1 + 100) + '%; animation-delay: 0.' + randoHundo + 's; animation-duration: 0.5' + randoHundo + 's;"><div class="stem" style="animation-delay: 0.' + randoHundo + 's; animation-duration: 0.5' + randoHundo + 's;"></div><div class="splat" style="animation-delay: 0.' + randoHundo + 's; animation-duration: 0.5' + randoHundo + 's;"></div></div>';
    backDrops += '<div class="drop" style="right: ' + increment + '%; bottom: ' + (randoFiver + randoFiver - 1 + 100) + '%; animation-delay: 0.' + randoHundo + 's; animation-duration: 0.5' + randoHundo + 's;"><div class="stem" style="animation-delay: 0.' + randoHundo + 's; animation-duration: 0.5' + randoHundo + 's;"></div><div class="splat" style="animation-delay: 0.' + randoHundo + 's; animation-duration: 0.5' + randoHundo + 's;"></div></div>';
  }

  jQuery('.rain.front-row').append(drops);
  jQuery('.rain.back-row').append(backDrops);
}

function removeCss(theme) {
  jQuery('#theme_' + theme).remove();
}
