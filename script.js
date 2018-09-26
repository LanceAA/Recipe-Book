var saveLog;
var recipeContainer = document.getElementById('root');
var recipeRow = document.getElementById('recipe-row');
var searchBar = document.getElementById('search-input');
var fieldCount = 1;
var ingredientAry = [];
var router = null;

var firstRecipe = {
  pic: 'assets/bacon.png',
  name: 'Bacon',
  ingredients: [{
    amount: '1',
    unit: 'cup',
    food: 'ground beef'
  }],
  temp: '350F',
  time: '50 minutes',
  instructions: 'Bake then take'
}

var secondRecipe = {
  pic: 'assets/egg.png',
  name: 'Egg',
  ingredients: [{
    amount: '0.5',
    unit: 'cup',
    food: 'ground beef'
  }],
  temp: '300F',
  time: '10 minutes',
  instructions: 'Buy then fry'
}

var thirdRecipe = {
  pic: 'assets/avocado.png',
  name: 'Avocado',
  ingredients: [{
    amount: '2',
    unit: 'cup',
    food: 'ground beef'
  }],
  temp: '72F',
  time: 'a few years',
  instructions: 'Grow then sow'
}

var pictureKeywords = {Default: 'assets/placeholder.png',
                       Pork: 'assets/pork.jpg',
                       Beef: 'assets/beef.png',
                       Chicken: 'assets/chicken.png',
                       Rice: 'assets/rice.jpg',
                       Pasta: 'assets/pasta.png',
                       Taco: 'assets/taco.png',
                       Potato: 'assets/potato.jpeg'};

if (localStorage.getItem('saveLog-recipe')) {
  saveLog = JSON.parse(localStorage.getItem('saveLog-recipe'));
} else {
  saveLog = [];
}

searchBar.addEventListener('keyup', matchIngredientSearch);
window.addEventListener('load', function () {
  router = new Router(routes);
})

//setup for example recipes
/*for (var i = 0; i < 12; i++) {
  saveLog.push(firstRecipe);
  saveLog.push(secondRecipe);
  saveLog.push(thirdRecipe);
}

localStorage.setItem('saveLog-recipe', JSON.stringify(saveLog));*/

//beginning of num2fraction
var abs = Math.abs
var round = Math.round

function almostEq(a, b) {
  return abs(a - b) <= 9.5367432e-7
}

function GCD(a, b) {
  if (almostEq(b, 0)) return a
  return GCD(b, a % b)
}

function findPrecision(n) {
  var e = 1

  while (!almostEq(round(n * e) / e, n)) {
    e *= 10
  }

  return e
}

function num2fraction(num) {
  if (num === 0 || num === '0') return '0'

  if (typeof num === 'string') {
    num = parseFloat(num)
  }


  var precision = findPrecision(num)
  var number = num * precision
  var gcd = abs(GCD(number, precision))

  var numerator = number / gcd
  var denominator = precision / gcd
  var intDigit = 0;
  var isMixedFraction;
  var isFraction;

  while (numerator >= denominator) {
    numerator -= denominator;
    intDigit++;
  }

  isMixedFraction = intDigit + ' & ' + round(numerator) + '/' + round(denominator);
  isFraction = round(numerator) + '/' + round(denominator);

  return intDigit == 0 ? isFraction : isMixedFraction;
}

function Router(routes) {
  this.currentRoute = window.location.hash;
  this.routes = routes;

  findHashInRoutes(this.currentRoute) ? refreshHash(this.currentRoute) : window.location.hash = '#thumb';

  function findHashInRoutes(newHash) {
    return (routes[newHash])
  }

  function refreshHash(newHash) {
    window.location.hash = '#placeholder';
    window.location.hash = newHash;
  }

  window.addEventListener('hashchange', function () {
    var hash = window.location.hash;
    var route = this.routes[hash] || this.routes['#thumb'];

    document.getElementById('root').innerHTML = route.render(JSON.parse(localStorage.getItem('recipeIndex')));

    this.currentRoute = route;
  });
  this.refreshHash = refreshHash;
}

var routes = {
  '#thumb': {
    render: renderRecipesThumb
    },
  '#single': {
    render: renderRecipe
  },
  '#add': {
    render: renderAddRecipe
  }
};

function displayElementWithText(elementHTML, displayType, text) {
  var element = document.getElementById(elementHTML);
  element.innerText = text;
  element.style.display = displayType;
}

function hideElement(elementHTML) {
  var element = document.getElementById(elementHTML);
  element.style.display = 'none';
}

function invisibilizeElement(elementHTML) {
  var element = document.getElementById(elementHTML);
  element.style.visibility = 'hidden';
}

function focusElement(elementHTML) {
  var element = document.getElementById(elementHTML);
  element.style.visibility = 'visible';
}

function storeId(entryId) {
  localStorage.setItem('recipeIndex', JSON.stringify(entryId));
}

function transformToFrac(num, portionValue) {
  num *= portionValue;
  num = num % 1 == 0 ? num : num2fraction(num);
  return num
}

function updateLastEaten(entryId) {
  var newDate = new Date();
  saveLog[entryId].lastEaten = newDate.toDateString();
  localStorage.setItem('saveLog-recipe', JSON.stringify(saveLog));
  router.refreshHash('#thumb');
}

function replacePicSelectText(newText) {
  var picSelectBtn = document.getElementById('pic-select-btn');
  picSelectBtn.innerText = newText;
  renderImgPreview();
}

function renderImgPreview() {
  var imgPreview = document.getElementById('pick-pic-preview');
  var picSelectBtn = document.getElementById('pic-select-btn');
  var btnText = picSelectBtn.innerText;

  imgPreview.src = pictureKeywords[btnText];
}

function deleteEntry(id) {
  saveLog.splice(id, 1);
  localStorage.setItem('saveLog-recipe', JSON.stringify(saveLog));
  router.refreshHash('#thumb');
}

function saveEntry() {
  var ingredientPreviewDiv = document.getElementById('ingredient-display-div');
  var imgPreview = document.getElementById('pick-pic-preview').src;
  var nameVal;
  var timeVal;
  var tempVal;
  var instructionsVal;
  var recipeEntry;

  if (ingredientPreviewDiv == null || ingredientPreviewDiv.childElementCount == 0) {
    displayElementWithText('error-p', 'block', 'At least one ingredient is required before adding recipe');
  } else {
    nameVal = document.getElementById('foodName').value;
    timeVal = document.getElementById('cookTime').value;
    tempVal = document.getElementById('tempText').value;
    instructionsVal = document.getElementById('instructionsText').value;

    recipeEntry = {
      pic: imgPreview,
      name: nameVal,
      ingredients: ingredientAry,
      temp: tempVal,
      time: timeVal,
      instructions: instructionsVal
    };

    saveLog.push(recipeEntry);
    localStorage.setItem('saveLog-recipe', JSON.stringify(saveLog));
    ingredientAry = [];
    router.refreshHash('#thumb');
  }
}

function matchIngredientSearch() {
  var thumbContainer;
  var foodIndex;

  for (var i = 0; i < saveLog.length; i++) {
    for (var j = 0; j < saveLog[i].ingredients.length; j++) {
      thumbContainer = document.getElementById('thumb-container' + i);
      foodIndex = saveLog[i].ingredients[j].food.indexOf(searchBar.value);

      if (foodIndex >= 0 || searchBar.value == '') {
        thumbContainer.classList.remove('no-display');
      } else {
        thumbContainer.classList.add('no-display');
      }
    }
  }
}

function storeIngredients() {
  var amntElmt = document.getElementById('ingredient-amount');
  var unitElmt = document.getElementById('ingredient-unit');
  var foodElmt = document.getElementById('ingredient-food-item');
  var amntVal = amntElmt.value;
  var amntSplit = amntVal.split('.');
  var amntFloat = parseFloat(amntVal);
  var ingredientObj;

  //conversion required for num2fraction because 0.33 != 1/3 and 0.66 != 2/3
  if (parseInt(amntSplit[1]) == 33) {
    amntFinal = Math.floor(amntSplit[0]) + 0.3333333333333;
  } else if (parseInt(amntSplit[1]) == 66) {
    amntFinal = Math.floor(amntSplit[0]) + 0.6666666666666666;
  } else {
    amntFinal = amntFloat;
  }

  if (amntVal == '') {
    displayElementWithText('error-p', 'block', 'Please fill first field');
  } else {
    hideElement('error-p');
    ingredientObj = {
      amount: amntFinal,
      unit: unitElmt.value,
      food: foodElmt.value
    };

    ingredientAry.push(ingredientObj);
    amntElmt.value = '';
    unitElmt.value = '';
    foodElmt.value = '';
    renderIngredientElements();
  }
}

function calculatePortion(recipeId) {
  var portionSlider = document.getElementById('portion-slider').value;
  var listDiv2 = document.getElementById('ingredient-list-div');
  var listPlaceholder = '';
  var saveLogIngredients = saveLog[recipeId].ingredients;
  var ingredientAmt;
  var ingredientList;

  for (var i = 0; i < saveLogIngredients.length; i++) {
    ingredientAmt = transformToFrac(saveLogIngredients[i].amount, portionSlider);
    ingredientList = document.getElementById('r-ingredient-text' + i);
    ingredientList.innerText = ingredientAmt +
      ' ' +
      saveLogIngredients[i].unit +
      ' ' +
      saveLogIngredients[i].food;
  }
}

function identifyCheckboxState(id) {
  var checkbox = document.getElementById('r-ingredient-checkbox' + id);
  var text = document.getElementById('r-ingredient-text' + id);

  text.style = checkbox.checked ? 'color: rgba(0, 0, 0, 0.2)' :
                                  'color : rgba(0, 0, 0, 0.65)';
}

function renderIngredientElements() {
  var displayBox = document.getElementById('display-box');
  var ingredient = '';
  var ingredientList;

  for (var i = 0; i < ingredientAry.length; i++) {
    ingredient += `<div class='ingredient-preview'>
                     <li class='ingredient-preview-text'>
                           ${transformToFrac(ingredientAry[i].amount, 1)} 
                           ${ingredientAry[i].unit} 
                           ${ingredientAry[i].food}
                     </li>
                     <button 
                       type='button' 
                       onclick='removeIngredientElement(${i})'
                       class='ingredient-preview-delete-btn btn'>X
                     </button>
                   </div>`;
  }
  ingredientList = `<ul id='ingredient-display-div'>${ingredient}</ul>`;

  displayBox.innerHTML = ingredientList;
}

function removeIngredientElement(elementIndex) {
  if (elementIndex == 0) {
    ingredientAry.splice(0, 1);
  } else {
    ingredientAry.splice(elementIndex, elementIndex);
  }
  renderIngredientElements();
}

function renderAddRecipe() {
  searchBar.disabled = true;
  var addMenu = `<form id='add-form'>
                   <div class='add-menu-input-field'>
                     <label for='foodName'>Name</label>
                     <input id='foodName' 
                            type='text' 
                            class='form-control' 
                            placeholder='Name'>
                   </div>
                   <div class='add-menu-input-field'>
                     <label for='cookTime'>Cook time</label>
                     <input id='cookTime'
                            type='text' 
                            class='form-control' 
                            placeholder='50 minutes'>
                   </div>
                   <div class='add-menu-input-field'>
                     <label for='tempText'>Cook temperature</label>
                     <input id='tempText'
                            type='text' 
                            class='form-control' 
                            placeholder='350F'>
                   </div>
                   <p id='error-p' style='display:none'></p>
                   <div id='ingredients-input-div' class='add-menu-input-field'>
                     <div id='ingredient-label-and-field'>
                       <label for='ingredientText'>Ingredients</label>
                       <div id='ingredient-fields'>
                         <div class='col remove-col-pad-left'>
                           <input id='ingredient-amount' 
                                  type='number' 
                                  class='form-control' 
                                  placeholder='1'>
                         </div>
                         <div class='col'>
                           <input id='ingredient-unit' 
                                  type='text' 
                                  class='form-control' 
                                  placeholder='cup'>
                         </div>
                         <div class='col'>
                           <input id='ingredient-food-item' 
                                  type='text' 
                                  class='form-control' 
                                  placeholder='rice'>
                         </div>
                         <button type='button' 
                                 class='btn btn-info' 
                                 onclick='storeIngredients()'>+
                         </button>
                       </div>
                     </div>
                     <div id='display-box'>
                     </div>
                       <small 
                         id='ingredient-guideline' 
                         class='form-text' >Ingredient amounts that aren't
                                            whole numbers must be accurate
                                            to two decimal places. Ex. 1.33
                       </small>
                     </div>
                   </div>
                   <div class='add-menu-input-field'>
                     <label for='instructionsText'>Instructions</label>
                     <input id='instructionsText' 
                            type='text' 
                            class='form-control' 
                            placeholder='Put it in the thing and cook it'>
                   </div>
                   <div id='pick-pic-div'>
                     <p class='pick-pic-text'>
                       Choose a picture for your recipe:
                     </p>
                     <div id='dropdown-div' class="dropdown pick-pic-text">
                       <button id='pic-select-btn' 
                               class="btn btn-secondary dropdown-toggle" 
                               type="button" 
                               id="dropdownMenuButton" 
                               data-toggle="dropdown" 
                               aria-haspopup="true" 
                               aria-expanded="false">
                         Default
                       </button>
                       <div class="dropdown-menu" >
                         <a id='picture-default' 
                            class="dropdown-item" 
                            onclick='replacePicSelectText("Default")'>Default
                         </a>
                         <a id='picture-pork' 
                            class="dropdown-item" 
                            onclick='replacePicSelectText("Pork")'>Pork
                         </a>
                         <a id='picture-beef' 
                            class="dropdown-item" 
                            onclick='replacePicSelectText("Beef")'>Beef
                         </a>
                         <a id='picture-chicken' 
                            class="dropdown-item" 
                            onclick='replacePicSelectText("Chicken")'>Chicken
                         </a>
                         <a id='picture-rice' 
                           class="dropdown-item" 
                           onclick='replacePicSelectText("Rice")'>Rice
                         </a>
                         <a id='picture-pasta' 
                            class="dropdown-item" 
                            onclick='replacePicSelectText("Pasta")'>Pasta
                         </a>
                         <a id='picture-taco' 
                            class="dropdown-item" 
                            onclick='replacePicSelectText("Taco")'>Taco
                         </a>
                         <a id='picture-potato' 
                            class="dropdown-item" 
                            onclick='replacePicSelectText("Potato")'>Potato
                         </a>
                       </div>
                     </div>
                     <img id='pick-pic-preview' src='assets/placeholder.png'>
                   </div>
                   <div>
                     <button type='button' 
                             class='btn btn-outline-success' 
                             onclick='saveEntry()'>Add
                     </button>
                     <a id='add-menu-cancel-btn' 
                        href='#thumb' 
                        class='btn btn-outline-danger'>Cancel
                     </a>
                   </div>
                 </form>`

  return addMenu;
}

function renderRecipesThumb() {
  searchBar.disabled = false;
  ingredientAry = [];
  var thumbnail = '';
  var entry;
  var checkEaten;
  var rowContainer;

  for (var i = 0; i < saveLog.length; i++) {
    entry = saveLog[i];
    checkEaten = entry.lastEaten ? 'Last Eaten: ' + 
                                   entry.lastEaten : 
                                   'Last Eaten: Never';
    thumbnail += 
    `<div id='thumb-container${i}' 
          class='col-4'>
       <div class='card'>
         <div id='delete-entry-container'
              class='delete-entry-container'>
           <div id='delete-confirm-container${i}'
                class='delete-confirm-container'>
             <p id='delete-confirm-text'>Are you sure?</p>
             <button id='confirm-btn-yes'
                     class='btn'
                     onclick='deleteEntry(${i})'>Yes
             </button>
             <button id='confirm-btn-no'
                     class='btn'
                     onclick='invisibilizeElement("delete-confirm-container${i}")'>No
             </button>
           </div>
             <button id='delete-btn' 
                     class='btn btn-danger'
                     onclick='focusElement("delete-confirm-container${i}")'>X
             </button>
         </div>
         <div class='img-thumb-div'>
           <a href='#single'
              onclick='storeId(${i})'>
             <img src='${entry.pic}' 
                  class='card-img-top entry-pic'>
           </a>
         </div>
         <div class='card-body'>
           <p class='card-text'>${entry.name}</p>
           <p id='just-ate-text' class='card-text'>${checkEaten}</p>
           <button id='just-ate-btn' 
                   class='btn btn-outline-primary btn-lg btn-block' 
                   onclick='updateLastEaten(${i})'>Just Ate
           </button>
         </div>
       </div>
     </div>`
  }
  rowContainer = 
  `<div class='row'>
    ${thumbnail}
   </div> `;

   return rowContainer;
}

function renderRecipe(recipeId) {
  searchBar.disabled = true;
  ingredientAry = [];
  var listDiv;
  var listPlaceholder = '';
  var saveLogIngredients = saveLog[recipeId].ingredients;
  var ingredientAmt;
  var dynamicElementPlaceholder;

  for (var i = 0; i < saveLogIngredients.length; i++) {
    ingredientAmt = transformToFrac(saveLogIngredients[i].amount, 1);
    listPlaceholder += `<div class='ingredient-div'>
                          <input id='r-ingredient-checkbox${i}' 
                                 class='checkbox'
                                 type='checkbox' 
                                 onclick='identifyCheckboxState(${i})'>
                          <li id='r-ingredient-text${i}'
                              class='ingredient-list'>${
                                ingredientAmt + ' ' +
                                saveLog[recipeId].ingredients[i].unit + ' ' +
                                saveLog[recipeId].ingredients[i].food}
                          </li>
                        </div>`;
  }

  listDiv = `<div id='ingredient-list-div'>${listPlaceholder}</div>`

  dynamicElementPlaceholder =
    `<div id='container-main-single'>
        <img src=${saveLog[recipeId].pic}>
        <h1>${saveLog[recipeId].name}</h1>
        <ul>Ingredients</ul>
        <div id='slider-container'>
          <div id='tickmark-container'>
            <p class='tickmark'
               id='t0-5'>0.5</p>
            <p class='tickmark'
               id='t1'>1</p>
            <p class='tickmark'
               id='t1-5'>1.5</p>
            <p class='tickmark'
               id='t2'>2</p>
          </div>
          <input id='portion-slider'
                 type='range'
                 list='tickmarks'
                 min='0.5'
                 max='2'
                 value='1'
                 step='0.5'
                 onchange='calculatePortion(${recipeId})'>
        </div>
        ${listDiv}
        <div id='cook-container-container'>
          <div id='cook-container-raw-text'>
            <p id='cook-time-temp'>Temp:</p>
            <p>${saveLog[recipeId].temp}</p>
          </div>
          <div id='cook-container-dynamic-info'>
            <p id='cook-time-temp'>Time:</p>
            <p>${saveLog[recipeId].time}</p>
          </div>
        </div>
        <h2>Instructions</h2>
        <div id='instructions'>
          <p>${saveLog[recipeId].instructions}</p>
        </div>
      </div>`

      return dynamicElementPlaceholder;
  }