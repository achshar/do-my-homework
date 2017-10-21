var
	// This array stores all the median values of the problem
	m = [],

	equation, derivative,

	// The default value of precision field
	limit = 2,

	a, b, elements,

	// Default value of the more button of the form
	more = false,

	// Default tab on page load
	currentTab = 1,

	// Number of equation fields on the page
	equationCount = 1,

	// Maximum number of equation fields allowed on page
	maximumEquationCount = 3;

// Select elements via css selectors
function $(id, forceQSA) {
	if(id.indexOf('.') > -1 || id.indexOf('#') > -1 || id.indexOf(' ') > -1 || forceQSA) return document.querySelectorAll(id);
	else return document.getElementById(id);
}

// Truncate an intiger to provided decimal limit
function t(number) {
	return Math[number < 0 ? 'ceil' : 'floor'](number * Math.pow(10, limit)) / Math.pow(10, limit);
}

// Execute the given equation
function f(x, d) {
	return eval(d ? derivative : equation);
}

// Returns the sign of an intiger
function sign(x) {
	return (x > 0) - (x < 0);
}

// Print a line in the output section
function show(text, tag) {
	if(!tag) tag = 'div';
	$('output').innerHTML += '<'+tag+'>' + text + '</'+tag+'>';
}

// Change the navigation tab
function updateTab() {
	[].forEach.call($('nav div'), function(div) {
		if(div.getAttribute('data-tab') == currentTab) div.classList.add('selected');
		else div.classList.remove('selected');
	});

	// Go through each tab and set the hidden class where necessery
	var i = 1;
	[].forEach.call($('section.tab'), function(section) {
		if(i == currentTab) section.classList.remove('hide');
		else section.classList.add('hide');
		i++;
	});
}

// Show appropiate imputs depending on the selected method
function updateFormInputs() {
	var names = ['derivative', 'precision', 'initialApproximation', 'a', 'b'], optionalNames = [1, 2, 3, 4], allowedNames = [], method = elements['method'].value;

	// Change the value of the more button
	elements['more'].value = more ? 'Less' : 'More';

	if(method == 'bisection' || method == 'regulaFalsi') {
		allowedNames = [1, 3, 4];
	} else if(method == 'newtonRaphson') {
		allowedNames = [0, 1, 2, 3, 4];
	} else if(method == 'gaussSeidel') {
		allowedNames = [];
	}

	for(var i = 0; i < names.length; i++) {
		if((!more && optionalNames.indexOf(i) > -1) || allowedNames.indexOf(i) < 0) {
			// If the more button is not clicked and the input is a part of more group
			// or if the input is not allowed in current method, hide the input
			elements[names[i]].classList.add('hide');
		} else {
			// Otheriwse, show the input
			elements[names[i]].classList.remove('hide');
		}
	}

	// Mark the derivative equation input required if the method is newtonRaphson
	elements['derivative'].required = method == 'newtonRaphson';
}

// This function loads the examples file, parses it and
// creates and injects the examples to the page DOM
function loadExamples() {
	var call = new XMLHttpRequest();
	call.open('GET', './js/examples.json', true);

	call.addEventListener('load', function() {
		var examples = JSON.parse(call.responseText),
			elementIds = ['equation1', 'equation2', 'equation3', 'derivative', 'precision', 'initialApproximation', 'a', 'b'],
			elementNames = ['Equation 1', 'Equation 2', 'Equation 3', 'Derivative', 'Precision', 'Initial Approximation', 'a', 'b'];

		for(var i = 0; i < examples.methods.length; i++) {
			var methodContainer = document.createElement('div'),
				name = document.createElement('div'),
				method = examples.methods[i];

			methodContainer.classList.add('method');

			// Add the method name and push it in the container
			name.classList.add('name');
			name.textContent = method.name;

			// Event listener to only show one method examples at a time
			name.addEventListener('click', function() {
				var methods = $('#examples .method');
				for(var i = 0; i < methods.length; i++) {
					if(methods[i] == this.parentElement) methods[i].classList.add('open');
					else methods[i].classList.remove('open');
				}
			});

			methodContainer.appendChild(name);

			// If there are no questions in a category
			if(!method.questions.length) {
				// Create a div with the not available message
				var NA = document.createElement('div');
				NA.classList.add('NA');
				NA.textContent = 'There are no examples in this category yet!';
				methodContainer.appendChild(NA);

				$('examples').appendChild(methodContainer);

				continue;
			}

			for(var j = 0; j < method.questions.length; j++) {
				var question = method.questions[j],
					questionContainer = document.createElement('div'),
					body = document.createElement('div'),
					elements = document.createElement('div'),
					checkThisOut = document.createElement('div');

				questionContainer.classList.add('question');

				if(question.body) {
					body.classList.add('body');
					body.innerHTML = question.body;
					questionContainer.appendChild(body);
				}

				elements.classList.add('elements');

				for(var k = 0; k < elementIds.length; k++) {
					if(!question[elementIds[k]]) continue;

					var element = document.createElement('div'),
						name = document.createElement('div'),
						value = document.createElement('div');
					element.classList.add('element');

					// Give the element a name from the names array
					name.classList.add('name');
					name.textContent = elementNames[k];
					element.appendChild(name);

					// Give the element it's value form the request data
					value.classList.add('value');
					value.textContent = question[elementIds[k]];
					element.appendChild(value)

					elements.appendChild(element);
				}

				questionContainer.appendChild(elements);

				checkThisOut.classList.add('checkThisOut');
				checkThisOut.textContent = 'Check This Out!';

				// A hack to solve the closure problem and send in
				// the value of loop variables to the event function
				(function() {
					var m = method, q = question;
					checkThisOut.addEventListener('click', function() {
						$('#form form')[0].reset();
						var elements = $('#form form')[0].elements;

						if(q['equation2']) addEquation();
						if(q['equation3']) addEquation();

						elements['method'].value = m.id;
						for(var k = 0; k < elementIds.length; k++) {
							if(q[elementIds[k]] && elements[elementIds[k]]) elements[elementIds[k]].value = q[elementIds[k]];
						}

						currentTab = 1;
						updateTab();

						more = true;
						updateFormInputs();

						$('#form input[type=submit]')[0].classList.add('blinking');
						$('#form input[type=submit]')[0].focus();
					});
				})();

				questionContainer.appendChild(checkThisOut);

				methodContainer.appendChild(questionContainer);
			}

			$('examples').appendChild(methodContainer);
		}
	});
	call.send();
}

// Add equations to the main form
function addEquation() {
	// Exit if the maximum limit for equations is reached
	if(equationCount >= maximumEquationCount) return;

	equationCount++;
	var div = document.createElement('div'),
		input = document.createElement('input'),
		span = document.createElement('span');

	div.classList.add('equation');

	// Give the input it's properties
	input.setAttribute('type', 'text');
	input.setAttribute('name', 'equation' + equationCount);
	input.setAttribute('placeholder', 'Equation ' + equationCount);

	// Give the remove span it's event handler
	span.textContent = 'x';
	span.addEventListener('click', function() {
		$('#equations > div')[0].removeChild(span.parentElement);
		equationCount--;
		var i = 2;
		[].forEach.call($('#form .equation span'), function(span) {
			span.parentElement.firstChild.setAttribute('name', 'equation' + i);
			span.parentElement.firstChild.setAttribute('placeholder', 'Equation ' + i);
			i++;
		});

		// Set the max number of allowed equations
		if(equationCount < maximumEquationCount) $('addEquation').classList.remove('hide');
	});

	// Combine everything
	div.appendChild(input);
	div.appendChild(span);
	$('#equations > div')[0].appendChild(div);

	// Set the max number of allowed equations
	if(equationCount == maximumEquationCount) $('addEquation').classList.add('hide');
}

window.addEventListener('load', function() {
	// Go through each tab and set up an event listener
	[].forEach.call($('nav div'), function(div) {
		div.addEventListener('click', function() {
			currentTab = div.getAttribute('data-tab');
			if(currentTab == 3 && !$('examples').textContent) loadExamples();
			updateTab();
		});
	});

	updateTab();

	elements = $('#form form')[0].elements;

	// Hide any elements not required when the method changes
	elements['method'].addEventListener('change', updateFormInputs);

	// Show more options
	elements['more'].addEventListener('click', function() {
		more = !more;
		updateFormInputs();
	});

	updateFormInputs();

	// Handle adding new equations
	elements['addEquation'].addEventListener('click', addEquation);

	$('#form input[type=submit]')[0].addEventListener('blur', function() {this.classList.remove('blinking');});

	$('#form form')[0].addEventListener('submit', function(e) {
		e.preventDefault();

		// Clear the blinking submit button if there was one
		$('#form input[type=submit]')[0].classList.remove('blinking');

		// Clear the output section before starting
		$('output').innerHTML = '';

		method = elements['method'].value;
		equation = elements['equation1'].value;
		derivative = elements['derivative'].value;
		limit =  parseInt(elements['precision'].value) || limit;
		initialApproximation =  parseFloat(elements['initialApproximation'].value);
		a = parseFloat(elements['a'].value);
		b = parseFloat(elements['b'].value);

		// Replace all symbols from the equation
		equation = equation.replace(/(pow|sqrt|exp|log|sin|cos|tan)/g, 'Math.$1');
		derivative = derivative.replace(/(pow|sqrt|exp|log|sin|cos|tan)/g, 'Math.$1');

		// TODO: generate the derivative equation if not given

		// If upper or lower bounds are not given generate them
		if((method == 'newtonRaphson' && !initialApproximation) || ((method == 'bisection' || method == 'regulaFalsi') && (!a || !b))) {
			var ta, tb;
			show('Bounds not given, generating automaticaly&hellip;', 'h4');

			for(var i = 0; ; i++) {
				// Just in case the loop goes haywire
				if(i > 25) {
					show('Iteration limit exceeded!', 'h3');
					return;
				}

				ta = f(i);
				tb = f(i + 1);

				show('Trying&hellip;');
				show('a = '+i+'; f(a) = '+t(ta), 'code');
				show('b = '+(i + 1)+'; f(b) = '+t(tb), 'code');

				// If either of the values are 0 then treat them as convenienet
				if(!ta) ta = sign(tb) * -1;
				else if(!tb) tb = sign(ta) * -1;

				// If ta and tb have opposite sign, halt search
				if(ta && sign(ta) * -1 == sign(tb)) {
					show('Match found!', 'h4');
					a = (ta < 0) ? i : i + 1;
					b = (tb > 0) ? i + 1 : i;
					break;
				}
			}
			show('a = ' + a, 'code');
			show('b = ' + b, 'code');
		}

		if(method == 'bisection' || method == 'regulaFalsi') {
			for(var i = 0; ; i++) {
				// Just in case the loop goes haywire
				if(i > 25) {
					show('Iteration limit exceeded!', 'h3');
					break;
				}

				// Calculate the approximate root
				if(method == 'bisection') {
					// Print iteration number
					show('Iteration ' + (i + 1), 'h3');

					m.push((a + b) / 2);

					show('m');
					show('&rarr; (a + b) / 2', 'code');
					show('&rarr; ('+t(a)+' + '+t(b)+') / 2', 'code');
					show('&rarr; ' + t(m[i]), 'code');
				} else if(method == 'regulaFalsi') {
					// Print iteration number
					show('Iteration ' + (i + 1), 'h3');

					m.push(( b * f(a) - a * f(b) ) / ( f(a) - f(b) ));

					show('m');
					show('&rarr; (b * f(a) - a * f(b)) / (f(a) - f(b))', 'code');
					show('&rarr; ('+t(b)+' * '+t(f(a))+' - '+t(a)+' * '+t(f(b))+') / ('+t(f(a))+' - '+t(f(b))+')', 'code');
					show('&rarr; ('+t(b * f(a))+' - '+t(a * f(b))+') / ('+t(f(a) - f(b))+')', 'code');
					show('&rarr; ' + t(m[i]), 'code');
				}

				// If the m is same as last m upto limit then exit
				if(i > 0 && t(m[i]) == t(m[i - 1])) {
					show('Answer: ' + t(m[i]), 'h3');
					break;
				}

				show('f(m)');
				show('&rarr; ' + elements['equation1'].value, 'code');
				show('&rarr; ' + elements['equation1'].value.replace(/exp/g, 'e').replace(/x/g, t(m[i])), 'code');
				show('&rarr; ' + t(f(m[i])), 'code');

				// If middle value is negative, substitute a
				if(f(m[i]) < 0) {
					a = m[i];
					show('m &rarr; a because f(m) is negative');
				}

				// Otherwise substitute b
				else {
					b = m[i];
					show('m &rarr; b because f(m) is postive');
				}
			}
		} else if(method == 'newtonRaphson') {
			for(var i = 0; ; i++) {
				// Just in case the loop goes haywire
				if(i > 25) {
					show('Iteration limit exceeded!', 'h3');
					break;
				}

				if(!i) {
					if(initialApproximation) m.push(initialApproximation);
					else {
						m.push((a + b) / 2);

						show('x<sub>0</sub>');
						show('&rarr; (a + b) / 2', 'code');
						show('&rarr; ('+t(a)+' + '+t(b)+') / 2', 'code');
						show('&rarr; ' + t(m[i]), 'code');
					}
				} else {
					// Print iteration number
					show('Iteration ' + i, 'h3');

					m.push(m[i - 1] - (f(m[i - 1]) / f(m[i - 1], true)));

					show('x<sub>1</sub>');
					show('&rarr; x<sub>0</sub> - (f(x<sub>0</sub>) / f\'(x<sub>0</sub>))', 'code');
					show('&rarr; '+t(m[i - 1])+' - ('+t(f(m[i - 1]))+' / '+t(f(m[i - 1], true))+')', 'code');
					show('&rarr; '+t(m[i - 1])+' - '+t(f(m[i - 1]) / f(m[i - 1], true)), 'code');
					show('&rarr; ' + t(m[i]), 'code');
				}

				// If the m is same as last m upto limit then exit
				if(i > 0 && t(m[i]) == t(m[i - 1])) {
					show('Answer: ' + t(m[i]), 'h3');
					break;
				}

				if(i) show('x<sub>1</sub> &rarr; x<sub>0</sub> because ' + limit + ' decimal places dont match!');
			}
		} else if(method == 'gaussSeidel') {
			// Make sure three equations are added
			if(!elements['equation1'] || !elements['equation2'] || !elements['equation3']) {show('This method needs three equations!', 'h4'); return;}

			// Set the intial values to 0
			var x = y = z = 0, equations = [elements['equation1'].value, elements['equation2'].value, elements['equation3'].value];
			function replaceVariable(string, a, b) {
				string = string.replace(a[0], t(a[1]));
				string = string.replace(b[0], t(b[1]));
				return string;
			}

			show('Initial equations&hellip;', 'h4');
			show(equations[0], 'code');
			show(equations[1], 'code');
			show(equations[2], 'code');


			for(var i = 0; ; i++) {
				// Just in case the loop goes haywire
				if(i > 25) {
					show('Iteration limit exceeded!', 'h3');
					break;
				}

				// Print iteration number
				show('Iteration ' + (i + 1), 'h3');

				show('<br>x = ' + t(x) + '; y = '+t(y)+'; z = ' + t(z), 'code');

				eval(equations[0]);
				show('<br>&rarr; ' + equations[0], 'code');
				show('&rarr; ' + replaceVariable(equations[0], ['y', y], ['z', z]), 'code');
				show('&rarr; x = ' + t(x), 'code');

				eval(equations[1]);
				show('<br>&rarr; ' + equations[1], 'code');
				show('&rarr; ' + replaceVariable(equations[1], ['x', x], ['z', z]), 'code');
				show('&rarr; y = ' + t(y), 'code');

				eval(equations[2]);
				show('<br>&rarr; ' + equations[2], 'code');
				show('&rarr; ' + replaceVariable(equations[2], ['x', x], ['y', y]), 'code');
				show('&rarr; z = ' + t(z), 'code');

				m[i] = [x, y, z];

				if(i && t(x) == t(m[i - 1][0]) && t(y) == t(m[i - 1][1]) && t(z) == t(m[i - 1][2])) {
					show('Answer:', 'h3');
					show('x = ' + Math.round(m[i][0]));
					show('y = ' + Math.round(m[i][1]));
					show('z = ' + Math.round(m[i][2]));
					break;
				}
			}
		}

		// Empty the approximation array
		m = [];
	});
});

/* Google Analytics code */

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-45774669-1', 'achshar.com');
ga('send', 'pageview');