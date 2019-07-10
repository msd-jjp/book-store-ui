import React from "react";
import { BaseComponent } from "../_base/BaseComponent";
import { TInternationalization } from "../../config/setup";
import { redux_state } from "../../redux/app_state";
import { MapDispatchToProps, connect } from "react-redux";
import { Dispatch } from "redux";
import { IBook } from "../../model/model.book";

interface IProps {
  internationalization: TInternationalization;
  match: any;
}
interface IState {
  book: IBook | undefined;
  pageLoader: boolean;
  errorText: string | undefined;
}
class BookDetailComponent extends BaseComponent<IProps, IState> {

  render() {
    return (
      <>
        <div className="book-detail-wrapper mt-3">

          {/* <!-- book-detail --> */}
          <section className="book-detail mx-3">
            <div className="row">
              <div className="col-4 mr-1">
                <div className="user-book">
                  <div className="slide-book">
                  </div>
                </div>
              </div>
              <div className="col-7 pr-0 pl-4">
                <h5 className="pl-2">What You Did</h5>
                <h6 className="pl-2">Claire McGowan</h6>
                <div className="rate-book pl-2">
                  <span className="fa fa-star checked"></span>
                  <span className="fa fa-star checked"></span>
                  <span className="fa fa-star checked"></span>
                  <span className="fa fa-star checked"></span>
                  <span className="fa fa-star"></span>
                </div>
                <span className="number pl-2">(127)</span>
                <div className="pointer-container mt-2 pl-2">
                  <div className="pointer mr-1 mt-0 pt-0 px-1">#1 Best Seller</div>
                  <span>in <a href="">Kindle Store</a></span>
                </div>
              </div>
            </div>
            <div className="row mx-2 my-2 add-link">
              <a href="">ADD TO LIST</a>
            </div>
          </section>
          
          {/* <!-- about the kindle --> */}
          <section className="about mx-3">
            <h4 className="my-1 mx-2">ABOUT THE KINDLE EDITION</h4>
            <div className="px-0 py-2 mx-1 my-3">
              <ul className="my-2">
                <li className="px-2">Length: 282 pages</li>
                <li className="px-2">Word Wise: Enabled</li>
                <li className="px-2">Screen Reader: Supported</li>
                <li className="px-2">Enhanced Typesetting: Enabled</li>
                <li className="px-2">Page Flip: Enabled</li>
              </ul>
            </div>
          </section>
          {/* <!-- from the editor --> */}
          <section className="editor mx-3">
            <h4 className="my-1 mx-2">FROM THE EDITOR</h4>
            <div className="px-0 py-2 mx-1 my-3 text-container">
              <div className="row ml-3">
                <div className="col-10 mr-0 pr-0">
                  <p className="mb-3">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aut repellendus eos earum optio?</p>
                  <p className="">Lorem ipsum dolor sit amet consectetur.</p>
                </div>
                <div className="col-1 pt-4 mr-0">
                  <a href="" className="pt-4 mr-0">
                    <i className="mr-0 fa fa-angle-right text-muted pt-4"></i>
                  </a>
                </div>
              </div>
            </div>
          </section>
          {/* <!-- about this item --> */}
          <section className="this-item mx-3">
            <h4 className="my-1 mx-2">ABOUT THIS ITEM</h4>
            <div className="px-0 py-2 mx-1 mt-3 mb-0 text-container-1">
              <h5 className="mx-4">DESCRIPTION</h5>
              <h5 className="mx-4">PRODUCT DESCRIPTION</h5>
              <p className="bold mx-4">Lorem ipsum dolor sit amet consectetur adipisicing elit. Nihil beatae accusantium ipsum hic sapiente placeat neque, ducimus delectus aspernatur!</p>
              <p className="bold mx-4">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Magni alias quae deserunt, maiores eum praesentium.</p>
              <p className="mx-4 normal-txt">Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore corporis numquam sint ex molestias quis! Aut quasi voluptas, unde sit, voluptatibus eveniet cupiditate deserunt facilis nesciunt, sequi asperiores. Temporibus, qui incidunt ipsum consequatur perspiciatis error.</p>
              <p className="mx-4 normal-txt">Lorem ipsum dolor sit amet consectetur adipisicing elit. Culpa, ullam, quos incidunt explicabo asperiores aut optio iure blanditiis, at possimus tempora quam ea laborum neque. Earum optio molestias libero, exercitationem in laboriosam unde aperiam sint.</p>
              <p className="mx-4 normal-txt">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Excepturi soluta illum quaerat nam esse ab animi dignissimos dolores nesciunt non!</p>
              <h5 className="mx-4 my-2">REVIEW</h5>
              <p className="mx-4 normal-txt mb-0">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Excepturi ab</p>
              <p className="bold mx-4 mt-0">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Magni alias quae deserunt</p>
              <p className="mx-4 normal-txt mb-0">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Excepturi ab Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
              <p className="bold mx-4 mt-0">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Magni alias quae deserunt</p>
              <p className="mx-4 normal-txt mb-0">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Excepturi ab Lorem ipsum dolor sit amet consectetur adipisicing elit Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolores, consequatur.</p>
              <p className="bold mx-4 mt-0">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Magni alias quae deserunt</p>
              <p className="mx-4 normal-txt mb-0">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Excepturi ab Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
              <p className="bold mx-4 mt-0">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Magni alias quae deserunt</p>
              <p className="mx-4 normal-txt mb-0">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Excepturi ab Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
              <p className="bold mx-4 mt-0">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Magni alias quae deserunt</p>
              <p className="mx-4 normal-txt mb-0">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Excepturi ab Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
              <p className="bold mx-4 mt-0">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Magni alias quae deserunt</p>
              <p className="mx-4 mt-2 normal-txt">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Iusto dolorem quam omnis aut inventore nostrum, explicabo, saepe magnam officia ipsum maiores eaque eum? Quaerat, optio? Vel ea quaerat corporis cum, reprehenderit voluptates earum facere vitae! Lorem, ipsum.</p>
              <h5 className="mx-4 my-2">ABOUT THE AUTHOR</h5>
              <p className="normal-txt mx-4 mb-3">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Magni, ullam libero autem eius natus optio nostrum fugiat hic sapiente placeat velit veniam animi culpa, voluptatum officia id! Ullam tempora nesciunt eligendi saepe esse, iste quisquam molestiae enim quae perspiciatis vel.</p>
            </div>
            <div className="px-0 pb-2 pt-4 mx-1 mt-0 text-container-2">
              <h5 className="mx-4">FEATURES & DETAILS</h5>
              <h5 className="mx-4">PRODUCT DETAILS</h5>
              <h6 className="mx-4">
                Publication date:
                    <span> August 1, 2019</span>
              </h6>
              <h6 className="mx-4">
                Publisher:
                    <span> Thomas & Mercer</span>
              </h6>
              <h6 className="mx-4">
                Language:
                    <span> English</span>
              </h6>
              <h6 className="mx-4">
                ASIN:
                    <span> B07KPFLD6Q</span>
              </h6>
              <h6 className="mx-4">
                Amazon.com Sales Rank:
                    <span> 1</span>
              </h6>
            </div>
          </section>
          {/* <!-- about the author --> */}
          <section className="author pb-2 px-1 mx-3">
            <h4 className="mt-4 mb-2 px-2">ABOUT THE AUTHOR</h4>
            <div className="author-info mb-2">
              <div className="txt pt-3 pb-2">
                <p className="mx-4 px-1">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Accusantium, cupiditate?</p>
              </div>
              <div className="row author-profile">
                <div className="col-4 img my-4 mx-2">
                  <div className="mx-2 my-2">
                    <img src="" alt="" />
                  </div>
                </div>
                <div className="col-6 my-4 px-0">
                  <div className="my-2 mr-0 pr-0">
                    <h6 className="mb-2">Claire McGowan</h6>
                    <button className="mt-4 btn btn-block" type="submit">+ FOLLOW</button>
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/* <!-- customers reviews --> */}
          <div className="Separator-border mx-0 px-0 my-2"></div>
          <section className="customer-reviews mx-3 mb-4">
            <div className="row">
              <div className="col-10 ml-3 mr-0 pr-0">
                <h4 className="mt-4 mb-2">127 CUSTOMER REVIEWS</h4>
                <div className="rate-customer mr-1">
                  <span className="fa fa-star checked"></span>
                  <span className="fa fa-star checked"></span>
                  <span className="fa fa-star checked"></span>
                  <span className="fa fa-star checked"></span>
                  <span className="fa fa-star"></span>
                </div>
                <span className="ml-1">4.2 out of 5 stars</span>
              </div>
              <div className="col-1 pt-4 mr-0">
                <a href="" className="pt-4 mr-0">
                  <i className="mr-0 fa fa-angle-right text-muted pt-4"></i>
                </a>
              </div>
            </div>
          </section>
          {/* <!-- read reviews that mention --> */}
          <section className="read-reviews mx-3">
            <h5 className="ml-3 mt-4">READ REVIEWS THAT MENTION</h5>
            <div className="row mt-3">
              <div className="col-5 ml-4">
                <div className="row">
                  <a href="">
                    <button className="btn btn-block py-2 px-1">well written</button>
                  </a>
                </div>
                <div className="row">
                  <a href="">
                    <button className="btn btn-block py-2 px-1">page turner</button>
                  </a>
                </div>
                <div className="row">
                  <a href="">
                    <button className="btn btn-block py-2 px-1">main character</button>
                  </a>
                </div>
              </div>
              <div className="col-5 ml-1">
                <div className="row">
                  <a href="">
                    <button className="btn btn-block py-2 px-1">twists and turns</button>
                  </a>
                </div>
                <div className="row">
                  <a href="">
                    <button className="btn btn-block py-2 px-1">claire mcgowan</button>
                  </a>
                </div>
                <div className="row">
                  <a href="">
                    <button className="btn btn-block py-2 px-1">kept me guessing</button>
                  </a>
                </div>
              </div>
            </div>
            <a href="" className="see-more ml-3">
              <i className="fa fa-angle-down my-3"></i>
              <span className="">See more</span>
            </a>
          </section>
          {/* <!-- comments --> */}
          <section className="comments mx-3 pb-4">
            <h5 className="ml-3 mt-3">TOP REVIEWS</h5>
            {/* <!-- comment 1 --> */}
            <div className="pl-3 mt-3 user-comment-box">
              <div className="row">
                <div className="col-1 mr-3">
                  <div className="img">
                    <img src="" alt="" />
                  </div>
                </div>
                <span className="pt-2 ml-3 mr-1">Rose</span>
                <span className="pt-2 mx-2">.</span>
                <span className="pt-2 ">July 1, 2019</span>
              </div>
              <div className="rate-comment mt-1">
                <span className="fa fa-star checked"></span>
                <span className="fa fa-star checked"></span>
                <span className="fa fa-star checked"></span>
                <span className="fa fa-star"></span>
                <span className="fa fa-star"></span>
              </div>
              <span className="ml-2 Verified-star">Verified Purchase</span>
              <div className="row ml-1 my-1">
                <span className="text-muted">Format:</span>
                <span className="text-muted pl-1">Kindle Edition</span>
              </div>
              <h6 className="my-2 ml-1">What You Did</h6>
              <p className="txt mx-1 my-0 pb-2">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Optio repellendus nam corporis! Ducimus minima veniam officia repudiandae libero sed culpa quis amet deserunt necessitatibus, consectetur, mollitia assumenda vitae alias aliquid quo dolores fuga doloribus id laborum, cupiditate vel nostrum ullam?
                    <a href="">See more</a>
              </p>
              <span className="text-muted mx-1">9 people found this helpful</span>
              <div className="helpful row mt-1 pt-1">
                <div className="col-5">
                  <a href=""><button className="btn btn-block">HELPFUL</button></a>
                </div>
                <div className="col-2 pt-2">
                  <a href="" className="text-muted">Report</a>
                </div>
              </div>
            </div>
            {/* <!-- comment 2 --> */}
            <div className="pl-3 mt-3 user-comment-box">
              <div className="row">
                <div className="col-1 mr-3">
                  <div className="img">
                    <img src="" alt="" />
                  </div>
                </div>
                <span className="pt-2 ml-3 mr-1">Trouble</span>
                <span className="pt-2 mx-2">.</span>
                <span className="pt-2 ">July 1, 2019</span>
              </div>
              <div className="rate-comment mt-1">
                <span className="fa fa-star checked"></span>
                <span className="fa fa-star checked"></span>
                <span className="fa fa-star checked"></span>
                <span className="fa fa-star"></span>
                <span className="fa fa-star"></span>
              </div>
              <span className="ml-2 Verified-star">Verified Purchase</span>
              <div className="row ml-1 my-1">
                <span className="text-muted">Format:</span>
                <span className="text-muted pl-1">Kindle Edition</span>
              </div>
              <h6 className="my-2 ml-1">What You Did</h6>
              <p className="txt mx-1 my-0 pb-2">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Optio repellendus nam corporis! Ducimus minima veniam officia repudiandae libero sed culpa quis amet deserunt necessitatibus, consectetur, mollitia assumenda vitae alias aliquid quo dolores fuga doloribus id laborum, cupiditate vel nostrum ullam?
                    <a href="">See more</a>
              </p>
              <span className="text-muted mx-1">9 people found this helpful</span>
              <div className="helpful row mt-1 pt-1">
                <div className="col-5">
                  <a href=""><button className="btn btn-block">HELPFUL</button></a>
                </div>
                <div className="col-2 pt-2">
                  <a href="" className="text-muted">Report</a>
                </div>
              </div>
            </div>
          </section>
          <div className="Separator-border mx-0 px-0 my-2"></div>
          {/* <!-- All reviews --> */}
          <div className="all-review mx-3 my-3 justify-content-between d-flex">
            <h6 className="mx-3">See all 127 reviews</h6>
            <i className="mx-3 fa fa-angle-right"></i>
          </div>
          <div className="Separator-border mx-0 px-0 my-2"></div>
          {/* <!-- write review --> */}
          <div className="write-review mx-3 my-3">
            <div className="write-box px-3 pt-3 pb-2 justify-content-between d-flex">
              <h6 className="mx-3">WRITE A REVIEW</h6>
              <i className="mx-3 fa fa-angle-right"></i>
            </div>
          </div>
          {/* <!-- search box --> */}
          <form className="search-box mx-3 mt-2" action="">
            <div className="row justify-content-between d-flex">
              <input className="ml-3 col-7 form-control btn-lg" type="text" name="" id="" placeholder="Search the Kindle Store" />
              <button className="mr-3 py-1 col-3 btn btn-block" type="submit">GO</button>
            </div>
          </form>

        </div>

      </>
    );
  }
}

const dispatch2props: MapDispatchToProps<{}, {}> = (dispatch: Dispatch) => {
  return {};
};

const state2props = (state: redux_state) => {
  return {
    internationalization: state.internationalization
  };
};

export const BookDetail2 = connect(
  state2props,
  dispatch2props
)(BookDetailComponent);
