
let testList = [];

function addRow(
    num,
    comment,
    exec
) {
    let table = document.getElementById( "test-list" );

    // make new row
    let tr = document.createElement( "tr" );
    let td_num = document.createElement( "td" );
    tr.appendChild( td_num );
    let td_button = document.createElement( "td" );
    tr.appendChild( td_button );
    let td_result = document.createElement( "td" );
    tr.appendChild( td_result );
    let td_comment = document.createElement( "td" );
    tr.appendChild( td_comment );
    table.appendChild( tr );

    // Column of "Number"
    td_num.innerText = num.toString();

    // Test function
    let test_func = function () {
        let result = [];
        exec( result );
        let resultHtml = "<table class='collapse'>";
        for ( let item of result ) {
            resultHtml += "<tr>";
            resultHtml += "<td class='result_" + item.result + "'>" + item.result + "</td>";
            resultHtml += "<td>" + item.message + "</td>";
            resultHtml += "</tr>";
        }
        td_result.innerHTML = resultHtml;
    }

    // Column of "Button"
    let button = document.createElement( "button" );
    td_button.appendChild( button );
    button.innerText = "start";
    button.addEventListener( "click", test_func );

    // Column of "Comment"
    td_comment.innerHTML = comment;
}

window.addEventListener( "load", function ( ev ) {
    testList.forEach( function ( item, i ) {
        addRow( i + 1, item.comment, item.exec );
    } );
} );

// templete
// test.push(
//     "Comment String",
//     function () {
//         let result = [];

//         // add result item
//         result.push( {
//             result: "OK",
//             message: "No problem."
//         } );

//         return result;
//     }
// );

// sortedArray
testList.push( {
    comment: "sortedArray",
    exec: function ( result ) {
        let sortedArray = new ooo.sortedArray();
        // function "add"
        {
            let array1 = [1, -1, 10, 0, -4, 5, -4, 1, 11, 14, 15, -2, -3, -130, 100928, -1029];
            let array2 = [-1029, -130, -4, -3, -2, -1, 0, 1, 5, 10, 11, 14, 15, 100928];
            for ( let i of array1 ) {
                sortedArray.add( i );
            }

            let check = "OK";
            for ( let i = 0; i < sortedArray.array.length; i++ ) {
                if ( sortedArray.array[i] !== array2[i] ) {
                    check = "NG";
                }
            }

            result.push( {
                result: check,
                message: JSON.stringify( sortedArray.array )
            } );
        }

        // function "last"
        {
            result.push( {
                result: sortedArray.last == 100928 ? "OK" : "NG",
                message: sortedArray.last.toString()
            } );
        }

        // function "clear"
        {
            sortedArray.clear();
            result.push( {
                result: sortedArray.array.length == 0 ? "OK" : "NG",
                message: JSON.stringify( sortedArray.array )
            } );
        }
    }
} );


