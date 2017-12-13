import Wallet from './wallet.class';

import Boat from './boat.class';

import Ranking from './ranking.class';

import BuyBoat from './boat.shop.class';

import ShopEquipement from './equipement.shop.class';

import Inventory from './inventory.class';

import Equipement from './equipement.class';

import ActionList from './actionList.class';

import RenderBoats from './renderBoats.class';

export default class Game
{
    constructor(config,shop_equipement)
    {
        this.name = config.name;

        // Launch map
        this.actionlist = new ActionList();

        // Creation de la wallet
        this.wallet = new Wallet(Number(config.wallet.gold), Number(config.wallet.ecu));

        // Creation des bateaux
        this.boats = {};

        let boat = null;

        this.id = 0;

        for (boat in config.boats) {
            if (config.boats.hasOwnProperty(boat)) {
                this.boats[this.id] = new Boat(config.boats[boat], this.id);
                this.id = this.boats[this.id].id;
                this.id++;
            }
        }

        // Creation de main Harbor
        this.mainHarbor = {};
        
        // Création des svg pour les bateaux
        this.renderBoats = new RenderBoats();
        this.renderBoats.createBoatsButton(this.boats);

        // Creation du shop
        this.mainHarbor.shop = {};
        this.mainHarbor.shop.equipement = {};

        this.mainHarbor.shop[`button 0`] = new BuyBoat(this.id);
        this.mainHarbor.shop.equipement = new ShopEquipement(this.id,shop_equipement);  

        this.inventory = new Inventory();

        for (let equipement in config.inventory) {
            if (config.inventory.hasOwnProperty(equipement)) {
                this.inventory[config.inventory[equipement].Nom] = new Equipement(config.inventory[equipement],
                    $(document.getElementById('equipement-model')),
                    config.inventory[equipement].id);
            }
        }

        this.mainHarbor.shop.equipement.inventoryPush(this);


        this.ranking = new Ranking();

        // Creation des références au parent dans les enfants

        this.setBoatParent(this);

        this.setWalletParent(this);

        this.setShopParent(this);

        this.saveDataJson(this);

        //Show Action List Start
        this.actionlist.showInAL (`Salut ${this.name} !`, 0);
        this.actionlist.showInAL (`Tu as ${this.wallet.ecu} écus `, 1000);
        this.actionlist.showInAL (`et ${this.wallet.gold} gold`, 1500);
    }

    // crée une référence au parent dans tous les enfants de bateau
    setBoatParent (o){
        if(o.boats != undefined){

            let n = null;
            for(n in o.boats){

                o.boats[n].parent = o;
                this.setBoatParent(o.boats[n]);
            }
        }
    }

    // crée une référence au parent dans tous les enfants de wallet
    setWalletParent(o){
        if (o.wallet != undefined){

            o.wallet.parent = o;
        }
    }

    // crée une référence au parent dans tous les enfants de shop
    setShopParent(o){
        if (o.mainHarbor.shop != undefined){

            let n = null;
            for(n in o.mainHarbor.shop){

                o.mainHarbor.shop[n].parent = o;
                this.setBoatParent(o.mainHarbor.shop[n]);
            }
        }
    }

    // fonction pour sauvegarder l'objet du joueur dans son json approprié
    saveDataJson(o){

        // premièrement dans cette fonction on va devoir enlever toutes les références au parent dans les enfants
        // donc on fait la même chose que dans les setParent, sauf qu'on delete les propriétés au lieu de les crées

        if(o.boats != undefined){

            let n = null;
            for(n in o.boats){

                delete o.boats[n].parent;
                delete o.boats[n].$el;
            }
        }
        if (o.wallet != undefined){

            delete o.wallet.parent;
        }
        if (o.mainHarbor.shop != undefined){

            delete o.mainHarbor.shop;
        }

        // ensuite on peut lancer la requete du fichier update_json_model.php

        $.ajaxSetup({
            async: false
        });

        $.post('', {
            player: o
        });

        $.ajaxSetup({
            async: true
        });

        this.setBoatParent(this);

        this.setWalletParent(this);

        this.setShopParent(this);
    }
}
