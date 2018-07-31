import { Data } from './data';
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { LoadingController } from 'ionic-angular';
import { Values } from './values';
import 'rxjs/add/operator/map';

@Injectable()
export class CartProvider {

    order_part_item_id: any;
    line_item_id: any;
    line_item: any;
    order_part: any;
    orderResponse: any;
    line_total: any;

    constructor(private http: Http, public values: Values, private loadingController: LoadingController, private data: Data) {

        //this.url = this.config.url;
    }

    emptyOrder() {
        this.values.cart = {
            "action": "post_order",
            "request": {
                "device_token": "",
                "user_token": "",
                "order": [{
                    "order_id": 0,
                    "buyer_id": 0,
                    "user_id": 0,
                    "masquerade_originator": 0,
                    "status": "REQUESTED",
                    "order_part_item_id": 0,
                    "total_line_items": 0,
                    "total_qty": 0,
                    "total_amount": 0,
                    "total_amount_rrp": 0,
                    "door": {
                        "door_first_name": "",
                        "door_last_name": "",
                        "door_company": "",
                        "door_email": "",
                        "door_address": "",
                        "door_address_2": "",
                        "door_city": "",
                        "door_state": "",
                        "door_postcode": "",
                        "door_telephone": "",
                        "door_country": "",
                    },
                    "sales_order_parts": []
                }]
            }
        };
    }

    emptyView() {
        this.values.vieworder = {
            "action": "",
            "request": {
                "device_token": "",
                "user_token": "",
                "order": [{
                    "order_id": 0,
                    "buyer_id": 0,
                    "user_id": 0,
                    "masquerade_originator": 0,
                    "status": "VIEW",
                    "order_part_item_id": 0,
                    "total_line_items": 0,
                    "total_qty": 0,
                    "total_amount": 0,
                    "total_amount_rrp": 0,
                    "door": {
                        "door_first_name": "",
                        "door_last_name": "",
                        "door_company": "",
                        "door_email": "",
                        "door_address": "",
                        "door_address_2": "",
                        "door_city": "",
                        "door_state": "",
                        "door_postcode": "",
                        "door_telephone": "",
                        "door_country": "",
                    },
                    "sales_order_parts": []
                }]
            }
        };
    }

    submitCart(mode) {
        console.log('Save Mode:' + mode)
        //  submit cart as an order
        let orderStatus = '';
        if (mode == 'final') {
            orderStatus = 'REQUESTED';
        }
        else {
            orderStatus = 'DRAFT';
        }
        this.values.cart.request.order[0].status = orderStatus;
        return new Promise(resolve => {
            this.data.consoleLog('this.values.cart', this.values.cart);
            let tempCart = {
                "action": "post_order",
                "request": {
                    "device_token": this.values.cart.request.device_token,
                    "user_token": this.values.cart.request.user_token,
                    "order": [{
                        "order_id": this.values.cart.request.order[0].order_id,
                        "buyer_id": this.values.cart.request.order[0].buyer_id,
                        "user_id": this.values.cart.request.order[0].user_id,
                        "masquerade_originator": this.values.cart.request.order[0].masquerade_originator,
                        "status": this.values.cart.request.order[0].status,
                        "order_part_item_id": this.values.cart.request.order[0].order_part_item_id,
                        "total_line_items": this.values.cart.request.order[0].total_line_items,
                        "total_qty": this.values.cart.request.order[0].total_qty,
                        "total_amount": this.values.cart.request.order[0].total_amount,
                        "total_amount_rrp": this.values.cart.request.order[0].total_amount_rrp,
                        "door": this.values.cart.request.order[0].door,
                        "sales_order_parts": []
                    }]
                }
            };
            for (let i = 0, len = this.values.cart.request.order[0].sales_order_parts.length; i < len; i++) {
                let temp_sales_order_part = {
                    "all_products": this.values.cart.request.order[0].sales_order_parts[i].all_products,
                    "buyer_id": this.values.cart.request.order[0].sales_order_parts[i].buyer_id,
                    "commission_rate": this.values.cart.request.order[0].sales_order_parts[i].commission_rate,
                    "currency_code": this.values.cart.request.order[0].sales_order_parts[i].currency_code,
                    "currency_symbol": this.values.cart.request.order[0].sales_order_parts[i].currency_symbol,
                    "designer_title": this.values.cart.request.order[0].sales_order_parts[i].designer_title,
                    "line_total": this.values.cart.request.order[0].sales_order_parts[i].line_total,
                    "seller_account_id": this.values.cart.request.order[0].sales_order_parts[i].seller_account_id,
                    "status": this.values.cart.request.order[0].sales_order_parts[i].status,
                    "total_amount": this.values.cart.request.order[0].sales_order_parts[i].total_amount,
                    "total_amount_rrp": this.values.cart.request.order[0].sales_order_parts[i].total_amount_rrp,
                    "total_line_items": this.values.cart.request.order[0].sales_order_parts[i].total_line_items,
                    "purchase_order": "",
                    "sales_order_lines": []
                }
                if (this.values.cart.request.order[0].sales_order_parts[i].hasOwnProperty('purchase_order')) {
                    temp_sales_order_part.purchase_order = this.values.cart.request.order[0].sales_order_parts[i].purchase_order;
                }
                for (let j = 0, len = this.values.cart.request.order[0].sales_order_parts[i].sales_order_lines.length; j < len; j++) {
                    if (this.values.cart.request.order[0].sales_order_parts[i].sales_order_lines[j].hasOwnProperty('size')) {
                        let temp_line = {
                            "colour": this.values.cart.request.order[0].sales_order_parts[i].sales_order_lines[j].colour,
                            "price": this.values.cart.request.order[0].sales_order_parts[i].sales_order_lines[j].price,
                            "product_id": this.values.cart.request.order[0].sales_order_parts[i].sales_order_lines[j].product_id,
                            "product_title": this.values.cart.request.order[0].sales_order_parts[i].sales_order_lines[j].product_title,
                            "size": [],
                            "variant_id": this.values.cart.request.order[0].sales_order_parts[i].sales_order_lines[j].variant_id,
                            "special_request": ""
                        };
                        for (let k = 0, len = this.values.cart.request.order[0].sales_order_parts[i].sales_order_lines[j].size.length; k < len; k++) {
                            let size_item = {
                                "variant_size_id": this.values.cart.request.order[0].sales_order_parts[i].sales_order_lines[j].size[k].variant_size_id,
                                "title": this.values.cart.request.order[0].sales_order_parts[i].sales_order_lines[j].size[k].title,
                                "qty": this.values.cart.request.order[0].sales_order_parts[i].sales_order_lines[j].size[k].qty,
                                "sku": this.values.cart.request.order[0].sales_order_parts[i].sales_order_lines[j].size[k].sku
                            }
                            temp_line.size.push(size_item);
                        }
                        if (this.values.cart.request.order[0].sales_order_parts[i].sales_order_lines[j].hasOwnProperty('special_request')) {
                            temp_line.special_request = this.values.cart.request.order[0].sales_order_parts[i].sales_order_lines[j].special_request;
                        }
                        temp_sales_order_part.sales_order_lines.push(temp_line);
                    }
                }
                tempCart.request.order[0].sales_order_parts.push(temp_sales_order_part);
            }
            this.data.consoleLog('tempCart', tempCart);
            let apiURL = this.values.APIRoot + "/app/api.php";
            let data = encodeURIComponent(JSON.stringify(tempCart));
            let headers = new Headers({
                'Content-Type': 'application/x-www-form-urlencoded'
            });
            let options = new RequestOptions({
                headers: headers
            });
            // TODO: Encode the values using encodeURIComponent().
            let body = 'json=' + data

            this.http.post(apiURL, body, options)
                .map(res => res.json())
                .subscribe(data => {
                    console.log('Got Response to Order Submit from API');
                    this.orderResponse = data;
                    this.data.consoleLog('this.orderResponse',this.orderResponse);
                    resolve(this.orderResponse);
                });
        });
    }

    addToCart(product_title, colour, material, swatch, image, designer_title, designer_id, product_id, variant_id,
        size, size_id, type, qty, price, price_rrp, prodsku: string) {

        //console.log('Start:Adding to cart');

        //new order, set buyer_id
        if (this.values.cart.request.order[0].buyer_id == 0) {
            this.values.cart.request.device_token = this.values.user_profile.device_token;
            this.values.cart.request.user_token = this.values.user_profile.user_token;
            this.values.cart.request.order[0].buyer_id = this.values.user_profile.buyer_id;
            this.values.cart.request.order[0].user_id = this.values.user_profile.user_id;
            this.values.cart.request.order[0].masquerade_originator = this.values.user_profile.masquerade_id;
        }

        //console.log('Check if designer is in cart');
        //check for designer in cart
        this.order_part_item_id = -1;
        //console.log('Cart Parts:' + JSON.stringify(this.values.cart.request.order[0].sales_order_parts));
        let abort = false;
        for (let pindex = 0, len = this.values.cart.request.order[0].sales_order_parts.length; pindex < len && !abort; pindex++) {
            if (this.values.cart.request.order[0].sales_order_parts[pindex].seller_account_id == designer_id) {
                this.order_part_item_id = pindex;
                abort = true;
            }
        };

        //add sales_order_line
        qty = parseInt(qty);
        if (isNaN(parseFloat(qty)) || (qty == undefined)) {
            qty = 0;
        }

        if (qty != undefined) {
            this.line_item = {
                'product_title': product_title,
                'product_id': product_id,
                'variant_id': variant_id,
                'variant_size_id': size_id,
                'size_title': size,
                'quantity': qty,
                'price': price,
                'price_rrp': price_rrp,
                'sku': prodsku,
                'material': material,
                'colour': colour,
                'swatch': swatch,
                'image': image
            }
            let hasVariant = 0;
            let totalVariantQty = 0;
            this.line_item_id = -1;

            if (this.order_part_item_id != -1) {
                let abort = false;
                for (let lindex = 0, len = this.values.cart.request.order[0].sales_order_parts[this.order_part_item_id].sales_order_lines.length;
                    lindex < len && !abort; lindex++) {
                    if (this.values.cart.request.order[0].sales_order_parts[this.order_part_item_id].sales_order_lines[lindex].
                        variant_id == this.line_item.variant_id) {
                        hasVariant = hasVariant + 1;
                        totalVariantQty = totalVariantQty + this.values.cart.request.order[0].sales_order_parts[this.order_part_item_id]
                            .sales_order_lines[lindex].quantity;
                    }
                    if (this.values.cart.request.order[0].sales_order_parts[this.order_part_item_id].sales_order_lines[lindex].sku == this.line_item.sku) {
                        this.line_item_id = lindex;
                        //if (qty > 0) { abort = true; }
                        //abort = true;
                    }
                };
            }

            //  add new line item or replace QTY
            let oldQty = 0;
            let doTally = 0;

            //new line item
            if (this.line_item_id == -1) {

                //  if a new designer (seller_account_id) then add sales_order_parts
                if (qty >= 0 || type == 'all') {
                    if (this.order_part_item_id == -1) {
                        this.line_total = price * qty;
                        this.order_part = {
                            'designer_title': designer_title,
                            'seller_account_id': designer_id,
                            'buyer_id': this.values.user_profile.buyer_id,
                            'status': 'REQUEST',
                            'commission_rate': '0.00',
                            'currency_code': '',
                            'total_line_items': 0,
                            'total_amount': '0.00',
                            'total_amount_rrp': '0.00',
                            'total_qty': 0,
                            'all_products': '',
                            'sales_order_lines': [this.line_item]
                        };
                        if (qty > 0) {
                            this.order_part.total_line_items = this.order_part.total_line_items + 1;
                            this.values.cart.request.order[0].total_line_items++;
                        }
                        this.order_part_item_id = this.values.cart.request.order[0].sales_order_parts.push(this.order_part) - 1;
                        console.log('New Order Part Index:' + this.order_part_item_id);
                    }
                    else {
                        this.values.cart.request.order[0].sales_order_parts[this.order_part_item_id].sales_order_lines.push(this.line_item);
                        if (totalVariantQty == 0 && totalVariantQty + qty > 0) {
                            this.values.cart.request.order[0].sales_order_parts[this.order_part_item_id].total_line_items = this.values.cart.request.
                            order[0].sales_order_parts[this.order_part_item_id].total_line_items + 1;
                            this.values.cart.request.order[0].total_line_items++;
                        }
                        // if (totalVariantQty > 0 && totalVariantQty + qty > 0) {
                        //     this.values.cart.request.order[0].sales_order_parts[this.order_part_item_id].total_line_items = this.values.cart.request.
                        //     order[0].sales_order_parts[this.order_part_item_id].total_line_items + 1;
                        // }
                        //this.data.consoleLog("totalVariantQty + qty", totalVariantQty + qty);
                    }
                    this.values.cart.request.order[0].sales_order_parts[this.order_part_item_id].total_qty = this.values.cart.request.order[0].
                        sales_order_parts[this.order_part_item_id].total_qty + qty;
                    this.values.cart.request.order[0].total_qty = this.values.cart.request.order[0].total_qty + qty;

                    doTally = 1;
                }
            }
            else {
                oldQty = this.values.cart.request.order[0].sales_order_parts[this.order_part_item_id].sales_order_lines[this.line_item_id].quantity;
                if (qty >= 0 || type == 'all') {
                    //  recalc order part old qty
                    doTally = 1;
                    this.values.cart.request.order[0].sales_order_parts[this.order_part_item_id].sales_order_lines[this.line_item_id].quantity = qty;
                    this.values.cart.request.order[0].sales_order_parts[this.order_part_item_id].total_qty = this.values.cart.request.order[0]
                        .sales_order_parts[this.order_part_item_id].total_qty + qty - oldQty;
                    //  recalc order part total amount / line items
                    this.values.cart.request.order[0].sales_order_parts[this.order_part_item_id].line_total = ((qty * price) - (oldQty * price));
                    //   if ((this.values.cart.request.order[0].sales_order_parts[this.order_part_item_id].sales_order_lines[this.line_item_id]
                    //     .quantity == 0) && (oldQty > 0)) {
                    //       if(hasVariant == 1) {
                    //         this.values.cart.request.order[0].sales_order_parts[this.order_part_item_id].total_line_items = this.values.cart.request.order[0].
                    //           sales_order_parts[this.order_part_item_id].total_line_items - 1
                    //       }  
                    //   }
                    //   if ((this.values.cart.request.order[0].sales_order_parts[this.order_part_item_id].sales_order_lines[this.line_item_id]
                    //     .quantity > 0) && (oldQty = 0)) {
                    //       if(hasVariant == 1) {
                    //         this.values.cart.request.order[0].sales_order_parts[this.order_part_item_id].total_line_items = this.values.cart.request.order[0].
                    //           sales_order_parts[this.order_part_item_id].total_line_items + 1
                    //       }  
                    //   }
                    if (totalVariantQty > 0 && (totalVariantQty - oldQty + qty) == 0) {
                        this.values.cart.request.order[0].sales_order_parts[this.order_part_item_id].total_line_items = this.values.cart.request.order[0].                     sales_order_parts[this.order_part_item_id].total_line_items - 1
                        this.values.cart.request.order[0].total_line_items--;
                    }
                    if (totalVariantQty == 0 && (totalVariantQty - oldQty + qty) > 0) {
                        this.values.cart.request.order[0].sales_order_parts[this.order_part_item_id].total_line_items = this.values.cart.request.order[0].                     sales_order_parts[this.order_part_item_id].total_line_items + 1
                        this.values.cart.request.order[0].total_line_items++;
                    }
                    this.data.consoleLog("totalVariantQty - oldQty + qty", totalVariantQty - oldQty + qty);
                }
                else {
                    //  remove the line item
                    console.log("remove order line");
                    //this.values.cart.request.order[0].sales_order_parts[this.order_part_item_id].sales_order_lines.splice(this.line_item_id,1);
                }

                //recalc order total qty
                this.values.cart.request.order[0].total_qty = this.values.cart.request.order[0].total_qty + qty - oldQty;
            }

            //  skip this if they tried to add new item with 0 QTY

            if (doTally == 1) {
                // recalc order part total
                let OldTotal = this.values.cart.request.order[0].sales_order_parts[this.order_part_item_id].total_amount;
                let NewTotal = OldTotal - (oldQty * price) + (qty * price);
                this.values.cart.request.order[0].sales_order_parts[this.order_part_item_id].total_amount = NewTotal;
                let OldTotal_rrp = this.values.cart.request.order[0].sales_order_parts[this.order_part_item_id].total_amount_rrp;
                let NewTotal_rrp = OldTotal_rrp - (oldQty * price_rrp) + (qty * price_rrp);
                this.values.cart.request.order[0].sales_order_parts[this.order_part_item_id].total_amount_rrp = NewTotal_rrp;
            }
        }
    }

    getSizeQty(sku, designer_id) {
        //  get the QTY of the SKU in the order part for design_id
        let qty = 0;
        let abort = false;
        for (let i = 0, len = this.values.cart.request.order[0].sales_order_parts.length; i < len && !abort; i++) {
            if (this.values.cart.request.order[0].sales_order_parts[i].seller_account_id == designer_id) {
                for (let j = 0, slen = this.values.cart.request.order[0].sales_order_parts[i].sales_order_lines.length; j < slen && !abort; j++) {
                    if (this.values.cart.request.order[0].sales_order_parts[i].sales_order_lines[j].sku == sku) {
                        qty = this.values.cart.request.order[0].sales_order_parts[i].sales_order_lines[j].quantity;
                        //console.log('Found QTY in the cart for SKU:' + sku + ' of '+ qty )
                        abort = true;
                        return qty;
                    }
                };
            }
        };
        //console.log('Found 0 QTY in cart for SKU:'+sku)
        return 0;
    }

    getViewSizeQty(sku, designer_id) {

        //  get the QTY of the SKU in the order part for design_id

        var qty = 0, abort = false;
        //for (let i = 0, len = this.values.vieworder.request.order[0].sales_order_parts.length; i < len && !abort; i++) { 
        //if (this.values.vieworder.request.order[0].sales_order_parts[0].seller_account_id == designer_id) {
        console.log('Found designer for this part that needs sizes.');
        for (let j = 0, slen = this.values.vieworder.request.order[0].sales_order_parts[0].sales_order_lines.length; j < slen && !abort; j++) {
            console.log('Sales Order Line:' + j);
            if (this.values.vieworder.request.order[0].sales_order_parts[0].sales_order_lines[j].sku == sku) {
                qty = this.values.vieworder.request.order[0].sales_order_parts[0].sales_order_lines[j].quantity;
                console.log('Found QTY in the cart for SKU:' + sku + ' of ' + qty);
                abort = true;
                return qty;
            }
        };
        //}
        //};
        console.log('Found 0 QTY in cart for SKU:' + sku)
        return 0;
    }

    clearSomeItem(variant_id, keepit) {
        console.log("======= clearSomeItem =======");
        let abort = false;
        for (let i = 0, len = this.values.cart.request.order[0].sales_order_parts.length; i < len && !abort; i++) {
            this.clearItem(i, -1, keepit, variant_id)
        }
    }

    clearItem(order_part, product_id, keepit, variant_id) {
        console.log("======= clearItem =======");
        console.log('Clear:' + order_part + ':' + product_id + ':' + variant_id)
        let abort = false;
        let variant_removed = false;
        //for (let i = 0, len = this.values.cart.request.order[0].sales_order_parts.length; i < len && !abort; i++) {  
        let i = order_part;
        for (let j = this.values.cart.request.order[0].sales_order_parts[i].sales_order_lines.length - 1; j > -1 && !abort; j--) {
            if (((variant_id == 0)) || (this.values.cart.request.order[0].sales_order_parts[i].sales_order_lines[j].variant_id == variant_id)) {

                // calc revised qty and total
                let qty = this.values.cart.request.order[0].sales_order_parts[i].sales_order_lines[j].quantity;

                console.log('Remove line item from order object: Variant ID:' + variant_id + ' Qty:' + qty);

                let price = this.values.cart.request.order[0].sales_order_parts[i].sales_order_lines[j].price;
                let total = this.values.cart.request.order[0].sales_order_parts[i].total_amount;
                let line_total = this.values.cart.request.order[0].sales_order_parts[i].line_total;
                let order_part_qty = this.values.cart.request.order[0].sales_order_parts[i].total_qty;
                let order_part_line_items = this.values.cart.request.order[0].sales_order_parts[i].total_line_items;
                total = total - (qty * price);
                line_total = line_total - (qty * price);
                order_part_qty = order_part_qty - qty;
                // set revised totals and qty
                this.values.cart.request.order[0].sales_order_parts[i].total_amount = total;
                this.values.cart.request.order[0].total_qty = this.values.cart.request.order[0].total_qty - qty;
                this.values.cart.request.order[0].sales_order_parts[i].line_total = line_total;
                this.values.cart.request.order[0].sales_order_parts[i].total_qty = order_part_qty;


                let price_rrp = this.values.cart.request.order[0].sales_order_parts[i].sales_order_lines[j].price_rrp;
                let total_rrp = this.values.cart.request.order[0].sales_order_parts[i].total_amount_rrp;
                //let line_total = this.values.cart.request.order[0].sales_order_parts[i].line_total;
                //let order_part_qty = this.values.cart.request.order[0].sales_order_parts[i].total_qty;
                //let order_part_line_items = this.values.cart.request.order[0].sales_order_parts[i].total_line_items;
                total_rrp = total_rrp - (qty * price_rrp);
                //line_total = line_total - (qty * price);
                //order_part_qty = order_part_qty - qty;
                // set revised totals and qty
                this.values.cart.request.order[0].sales_order_parts[i].total_amount_rrp = total_rrp;
                // this.values.cart.request.order[0].total_qty = this.values.cart.request.order[0].total_qty - qty;
                //this.values.cart.request.order[0].sales_order_parts[i].line_total = line_total;
                //this.values.cart.request.order[0].sales_order_parts[i].total_qty = order_part_qty;

                // remove the line item for this size variant 
                if (keepit == 1) {
                    this.values.cart.request.order[0].sales_order_parts[i].sales_order_lines[j].quantity = 0;
                }
                else {
                    this.values.cart.request.order[0].sales_order_parts[i].sales_order_lines.splice(j, 1);
                    if (variant_removed == false && qty > 0) { this.values.cart.request.order[0].sales_order_parts[i].total_line_items = order_part_line_items - 1 };
                    variant_removed = true;
                    //check if this was line in order part
                    if (this.values.cart.request.order[0].sales_order_parts[i].sales_order_lines.length == 0) {
                        this.values.cart.request.order[0].sales_order_parts.splice(i, 1);
                        if (this.values.cart.request.order[0].sales_order_parts.length == 0) {
                            this.emptyOrder();
                        }
                    }
                }
            }
        }
        //}  
    }
}

// (c) Copyright 2016-2017 Netambition Pty Ltd