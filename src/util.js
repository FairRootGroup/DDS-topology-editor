/* returns array of @property  values from @objArray*/
function extractProperties(objArr, property) {
	return objArr.map( function(element) {
		return element[property];
	});
}


/* Returns every joint element from elements array x 
 * that has a defined property.
 *  
 *
 * @param elementsArray {Array>@Joint.dia.Element} array where it is searched at.
 * @param property {String} prroperty we are searching for. 
 */
function sieveByProperty(elementsArray, property) {
	var result = [];
	elementsArray.forEach( function(element) {
		if (element.prop(property) !== undefined) {
			result.push(element);
		}
	});
	return result;
}

/* Returns all the properties shared between two tasks
 *
 *
 * @param {Array} taskProps
 * @param {Array} secondTaskProps
 * @param {number} firstIndex
 * @param {number} secondIndex 
 */
function findTasksLinks(taskProps, secondTaskProps, firstIndex, secondIndex) {
    var result = [];
    for (var i = 0; i < taskProps.length; i ++) {
        for ( var j = 0; j < secondTaskProps.length; j ++) {
            if (secondTaskProps[j].id == taskProps[i].id) {
                if (taskProps[i].access === 'write') {
                    result.push({
                        id: secondTaskProps[j].id,
                        source: firstIndex,
                        destination: secondIndex
                    });
                } else {
                    result.push({
                        id: secondTaskProps[j].id,
                        source: secondIndex,
                        destination: firstIndex
                    });
                }
                break;
            }
        }
    }
    return result;
}

// Event Functions 

function initiateDragging(evt, x, y) {
    dragging = true;
    paperPointerX = x;
    paperPointerY = y;
}