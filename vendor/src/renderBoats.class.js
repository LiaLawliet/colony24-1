export default class RenderBoats{
    constructor() {
        this.name = 'renderBoats';
    }

    createBoatsButton(boats){
        if ($('#svgBoats').length) {$('#svgBoats').remove()}
        let boatType = [];

        let boatCoordinate = {x:window.innerWidth/100,y:window.innerHeight/100};
        let boatSVGXY = [{x:boatCoordinate.x*27,y:boatCoordinate.y*75.5},{x:boatCoordinate.x*34.5,y:boatCoordinate.y*81},{x:boatCoordinate.x*41,y:boatCoordinate.y*80},{x:boatCoordinate.x*48,y:boatCoordinate.y*77}]
        let svgBoat = '<svg width="100%" height="'+window.innerHeight+'" id="svgBoats"">';

        for (let boat in boats) {
            if (boatType.indexOf(boats[boat].name) == -1) {
                boatType.push(boats[boat].name);
                svgBoat += '<image x="'+boatSVGXY[boatType.length-1].x+'px" y="'+boatSVGXY[boatType.length-1].y+'px" width="9%" height="9%" xlink:href="assets/svg/'+boats[boat].name+'.svg";" id="'+boats[boat].name+'"/>';
            }
        }
        svgBoat += '</svg>';
        $('#player-boats').prepend(svgBoat);

        $('#svgBoats').find('image').on('click',function(){
            let list = '<div id="boatList" style="background-color: rgba(0,250,125,0.5); position: absolute;width: 90%;height: 90%;left: 5%;top: 5%"><h1 id="echapBoat" style="position:absolute;right:2%;top:0px;">X</h1></div>';
            $('body').append(list);
            let id = this.id;
            for (let boat in boats) {
                if(boats[boat].name == id){
                    $('#boatList').append(`<li id="li${boats[boat].id}" style="display: inline-block">
                        <div>
                            <p style="width: 30%; margin: 0 auto">${boats[boat].name} x:${boats[boat].x} y:${boats[boat].y}</p>
                            <input style="width: 45%; margin: 0 auto" type="number" placeholder="x"/>
                            <input style="width: 45%; margin: 0 auto" type="number" placeholder="y"/>
                            <input type="button" id="move" value="Se déplacer"/>
                            <input type="button" id="boatEquipment" value="Equipement" data-id="${boats[boat].id}"/>
                        </div>
                    </li>`);
                    $(`li#li${boats[boat].id}`).on('click', `input[type='button']#move`, { that: boats[boat]}, function (e) {

                        let context = e.data.that;

                        let inputX = $(`#li${context.id} > div > input:nth-child(2)`).val();
                        let inputY = $(`#li${context.id} > div > input:nth-child(3)`).val();

                        if (inputX != 0 || inputY != 0){
                            context.movement(inputY, inputX);
                            $(`#li${context.id} > div > p`).html(`${context.name} x:${context.x} y:${context.y}`);
                        }
                    });

                    // click sur le bouton equipement d'un bateau
                    $(`li#li${boats[boat].id}`).on('click', `input[type='button']#boatEquipment`, { that: boats[boat]}, function (e) {
                        let context = e.data.that;
                        let parent = context.parent;
                        let equipement = parent.inventory;
                        let $eqt = $('ul#inventory2-model');
                        let dataId = $(this).data("id");

                        document.getElementById('popupEquipment').style.display = "block";
                        document.getElementById("popUp").style.display = "grid";

                        window.onclick = function(event) {
                            if (event.target === document.getElementById('background')) {
                                document.getElementById('popupEquipment').style.display = "none";
                                document.getElementById("popUp").style.display = "none";
                                $('ul#inventory2-model li').remove();
                            }
                        }

                        // Vérification des Values
                        for (let value in equipement) {
                            $eqt.append(`<li id="${value}" data-id="${dataId}"></li>`);
                            if (equipement.hasOwnProperty(value)) {
                                if (equipement[value] != "id") {
                                    let eqtProperty = "";
                                    for (let carac in equipement[value]) {
                                        if(equipement[value][carac] != "") {
                                            if (carac != 'id' && carac != 'Nom'  && carac != 'Prix') {
                                                eqtProperty += `<br/> ${carac} : ${equipement[value][carac]}`;
                                            }
                                        }
                                    }
                                    inventoryRender($eqt, value, eqtProperty);
                                }
                            }
                        }
                    });
                    // $('.closeButton').on('click', function() {
                    //   $(this).closest('.modal').css('display','none');
                    //   $(this).closest('.popUp').css('display','none');
                    // });

                    function inventoryRender($eqt, value, eqtProperty){
                        $eqt.children().last().append(`
                            <p style="color:black;">
                                ${value}
                                ${eqtProperty}
                            </p>
                        `);
                    }
                }
            }
            // Click sur un équipement de l'inventaire
            $(`ul#inventory2-model`).on('click', 'li',{ that: boats[0]}, function (e) {
                console.log(e.data.that);
                let context = e.data.that;
                let parent = context.parent;
                let equipement = parent.inventory;
                let equipementName = parent.inventory.Nom;
                let $eqt = $('ul#boatEquipment-model');

                let liId = $(this).attr('id');
                let dataId = $(this).data('id');

                // Vérification des Values
                equipement = equipement[liId];

                $eqt.append(`<li id="${liId}" data-id="${dataId}"></li>`);
                let eqtProperty = "";
                for (let carac in equipement) {
                    if(equipement[carac] != "") {
                        if (carac != 'id' && carac != 'Nom'  && carac != 'Prix') {
                            eqtProperty += `<br/> ${carac} : ${equipement[carac]}`;
                        }
                    }
                }
                $(this).remove();
                if (parent.boats[dataId].equipement) {
                    parent.boats[dataId].equipement[liId] = equipement;
                } else{
                    parent.boats[dataId].equipement = {};
                    parent.boats[dataId].equipement[liId] = equipement;
                }

                delete parent.inventory[liId];
                parent.saveDataJson(parent);
                inventoryRender($eqt, liId, eqtProperty);
                // console.log(parent.inventory);
            });

            // Click sur un équipement équipé à notre bateau
            $(`ul#boatEquipment-model`).on('click', 'li',{ that: boats[0]}, function (e) {

                let liId = $(this).attr('id');
                let dataId = $(this).data('id');

                let context = e.data.that;
                let parent = context.parent;
                let equipements = parent.boats[dataId].equipement;
                let equipementName = parent.inventory.Nom;
                let $eqt = $('ul#inventory2-model');

                // Vérification des Values
                let equipement = equipements[liId];

                $eqt.append(`<li id="${liId}" data-id="${dataId}"></li>`);
                let eqtProperty = "";
                for (let carac in equipement) {
                    if(equipement[carac] != "") {
                        if (carac != 'id' && carac != 'Nom'  && carac != 'Prix') {
                            eqtProperty += `<br/> ${carac} : ${equipement[carac]}`;
                        }
                    }
                }
                $(this).remove();

                parent.inventory[liId] = equipement;
                delete equipements[liId];
                parent.saveDataJson(parent);
                inventoryRender($eqt, liId, eqtProperty);
                // console.log(parent.inventory);
            });
            function inventoryRender($eqt, value, eqtProperty){
                $eqt.children().last().append(`
                    <p style="color:black;">
                        ${value}
                        ${eqtProperty}
                    </p>
                `);
            }

            $('#echapBoat').on('click', function(){
                this.closest('div').remove();
            })
        });
    }
}
