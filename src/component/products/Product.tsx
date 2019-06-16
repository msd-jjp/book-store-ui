import React from 'react';

export interface ProductItem {
    title: string;
    price: number;
    id: string;
}
export interface ProductProp {
    title: string;
    price: number;
}

class Product extends React.Component<ProductProp> {

    render() {
        if (this.props.title && this.props.price) {
            return (
                <div className="product">
                    title: {this.props.title}, price: {this.props.price}
                </div>
            )

        } else {
            return <div>product not valid</div>
        }
    }
}

export default Product;