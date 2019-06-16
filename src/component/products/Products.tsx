import React, { Fragment } from 'react';
import Product, { ProductItem } from './Product';

interface ProductsState {
    error: any;
    isLoaded: boolean;
    items: ProductItem[];
}

class Products extends React.Component<any, ProductsState> {
    state: ProductsState = {
        error: null,
        isLoaded: false,
        items: []
    }

    componentDidMount() {
        fetch("https://next.json-generator.com/api/json/get/Vy6Uk7PCU")
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        isLoaded: true,
                        items: result
                    });
                },
                (error) => {
                    this.setState({
                        isLoaded: true,
                        error
                    });
                }
            )
    }

    render() {
        const { error, isLoaded, items } = this.state;
        let test = 'hamidreza';
        let number = 88;
        if (error) {
            return <div>Error: {error.message}</div>;
        } else if (!isLoaded) {
            return <div>Loading...</div>;
        } else {
            return (
                <Fragment>
                    <Fragment>
                        {test}
                        <Fragment>{number}</Fragment>
                    </Fragment>

                    <div className="products">
                        {items.map(item => (
                            <Product title={item.title} price={item.price} key={item.id} />
                        ))}
                    </div>
                </Fragment>
            );
        }
    }

}

export default Products;