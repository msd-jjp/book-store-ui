import React, { Fragment } from "react";
import { MapDispatchToProps, connect } from "react-redux";
import { Dispatch } from "redux";
import { redux_state } from "../../redux/app_state";
import { IUser } from "../../model/model.user";
import { TInternationalization } from "../../config/setup";
import { BaseComponent } from "../_base/BaseComponent";
import { History } from "history";
import { IToken } from "../../model/model.token";
import { ToastContainer, toast } from "react-toastify";
import { Localization } from "../../config/localization/localization";
import { BtnLoader } from "../form/btn-loader/BtnLoader";
import { NETWORK_STATUS } from "../../enum/NetworkStatus";
import { PersonService } from "../../service/service.person";
import { Input } from "../form/input/Input";
import Dropzone from "react-dropzone";
import { AppRegex } from "../../config/regex";
import { UploadService } from "../../service/service.upload";
import { action_user_logged_in } from "../../redux/action/user";
import { IPerson } from "../../model/model.person";

interface IProps {
  logged_in_user: IUser | null;
  internationalization: TInternationalization;
  history: History;
  token: IToken;
  network_status: NETWORK_STATUS;
  onUserLoggedIn: (user: IUser) => void;
}

interface IState {
  person: {
    name: {
      value: string | undefined;
      isValid: boolean;
    };
    last_name: {
      value: string | undefined;
      isValid: boolean;
    };
    address: {
      value: string | undefined,
      isValid: boolean
    };
    phone: {
      value: string | undefined,
      isValid: boolean
    };
    email: {
      value: string | undefined,
      isValid: boolean
    };
    cell_no: {
      value: string | undefined,
      isValid: boolean
    };
    image: {
      value: string[],
      isValid: boolean
    };
  };
  isFormValid: boolean;
  saveLoader: boolean;
  saveBtnVisibility: boolean;
  fetchPerson_loader: boolean;
}

class ProfileComponent extends BaseComponent<IProps, IState> {
  state = {
    person: {
      name: {
        value: undefined,
        isValid: false,
      },
      last_name: {
        value: undefined,
        isValid: false,
      },
      address: {
        value: undefined,
        isValid: true,
      },
      phone: {
        value: undefined,
        isValid: true,
      },
      email: {
        value: undefined,
        isValid: true,
      },
      cell_no: {
        value: undefined,
        isValid: true,
      },
      image: {
        value: [],
        isValid: true,
      },
    },
    isFormValid: false,
    saveLoader: false,
    saveBtnVisibility: false,
    fetchPerson_loader: false,
  };

  private _personService = new PersonService();
  private _uploadService = new UploadService();

  constructor(props: IProps) {
    super(props);

    this._personService.setToken(this.props.token);
    this._uploadService.setToken(this.props.token);

  }

  componentDidMount() {
    this.fetchPerson();
  }

  private async fetchPerson() {
    let current_person = this.props.logged_in_user!.person;

    this.setState({
      ...this.state, fetchPerson_loader: true,
      person: {
        name: { value: current_person.name, isValid: !!current_person.name },
        last_name: { value: current_person.last_name, isValid: !!current_person.last_name },
        address: { value: current_person.address, isValid: true },
        phone: { value: current_person.phone, isValid: true },
        image: { value: current_person.image ? [current_person.image] : [], isValid: true },
        email: { value: current_person.email, isValid: true },
        cell_no: { value: current_person.cell_no, isValid: !!current_person.cell_no },
      }
    });

    if (this.props.network_status === NETWORK_STATUS.OFFLINE) return;

    let res = await this._personService.byId(this.props.logged_in_user!.person.id).catch(error => {
      this.handleError({ error: error.response });
      this.setState({ ...this.state, fetchPerson_loader: false });
    });

    if (res) {
      this.setState({
        ...this.state,
        fetchPerson_loader: false,
        saveBtnVisibility: true,
        person: {
          // ...this.state.person,
          name: { value: res.data.name, isValid: !!res.data.name },
          last_name: { value: res.data.last_name, isValid: !!res.data.last_name },
          address: { value: res.data.address, isValid: true },
          phone: { value: res.data.phone, isValid: true },
          image: { value: res.data.image ? [res.data.image] : [], isValid: true },
          email: { value: res.data.email, isValid: true },
          cell_no: { value: res.data.cell_no, isValid: !!res.data.cell_no },
        },
      });

      this.updateStoreData_profile(res.data);
    }
  }

  handleInputChange(value: any, isValid: boolean, inputType: any) {
    this.setState({
      ...this.state,
      person: {
        ...this.state.person, [inputType]: { value, isValid }
      }
      , isFormValid: this.checkFormValidate(isValid, inputType)
    })
  }

  checkFormValidate(isValid: boolean, inputType: any): boolean {
    let valid = true;
    let personObj: any = { ...this.state.person };

    for (let i = 0; i < Object.keys(this.state.person).length; i++) {
      let IT = Object.keys(this.state.person)[i];
      if (IT !== inputType) {
        valid = valid && personObj[IT].isValid;
        if (!personObj[IT].isValid) {
          break;
        }
      }
    }
    valid = valid && isValid;
    return valid;
  }

  async uploadFileReq(): Promise<string[]> {
    let fileImg = (this.state.person.image.value || []).filter(img => typeof img !== "string");
    let strImg = (this.state.person.image.value || []).filter(img => typeof img === "string");
    if (fileImg && (fileImg || []).length) {
      return new Promise(async (res, rej) => {
        let urls = await this._uploadService.upload(fileImg).catch(e => {
          rej(e);
        });
        if (urls) {
          res([...strImg, ...urls.data.result]);
        }
      });
    } else {
      return new Promise((res, rej) => {
        res(strImg || []);
      });
    }
  }

  async update() {
    if (!this.state.isFormValid) return;
    this.setState({ ...this.state, saveLoader: true });

    let imgUrls = await this.uploadFileReq().catch(error => {
      this.handleError({ error: error.response });
    });
    if (!imgUrls) {
      return
    }
    const newPerson = {
      name: this.state.person.name.value,
      last_name: this.state.person.last_name.value,
      address: this.state.person.address.value,
      phone: this.state.person.phone.value,
      image: imgUrls[0] || null, // '',
      email: this.state.person.email.value,
      // cell_no: this.state.person.cell_no.value,
    }
    let res = await this._personService.update(newPerson, this.props.logged_in_user!.person.id).catch(e => {
      this.handleError({ error: e.response });
    });

    this.setState({ ...this.state, saveLoader: false });

    if (res) {
      // let logged_in_user = { ...this.props.logged_in_user! };
      // logged_in_user.person.name = res.data.name;
      // logged_in_user.person.last_name = res.data.last_name;
      // logged_in_user.person.address = res.data.address;
      // logged_in_user.person.phone = res.data.phone;
      // logged_in_user.person.image = res.data.image;
      // logged_in_user.person.email = res.data.email;

      // this.props.onUserLoggedIn(logged_in_user);
      this.updateStoreData_profile(res.data);
      this.apiSuccessNotify();
    }

  }

  updateStoreData_profile(person: IPerson) {
    let logged_in_user = { ...this.props.logged_in_user! };
    if (!logged_in_user || !person) return;

    logged_in_user.person.name = person.name;
    logged_in_user.person.last_name = person.last_name;
    logged_in_user.person.address = person.address;
    logged_in_user.person.phone = person.phone;
    logged_in_user.person.image = person.image;
    logged_in_user.person.email = person.email;

    this.props.onUserLoggedIn(logged_in_user);
  }

  //#region dropzone
  onDropRejected(files: any[], event: any) {
    this.onDropRejectedNotify(files);
  }

  onDropRejectedNotify(files: any[]) {
    toast.warn(Localization.msg.ui.file_could_not_be_uploaded, this.getNotifyConfig({ toastId: 'file_could_not_be_uploaded' }));
  }

  removePreviousImgNotify() {
    toast.warn(Localization.msg.ui.one_img_upload_allowed_remove_existing_one, this.getNotifyConfig({ toastId: 'one_img_upload_allowed_remove_existing_one' }));
  }

  onDrop(files: any[]) {
    if (!files || !files.length) return;
    if (this.state.person.image.value && this.state.person.image.value!.length) {
      this.removePreviousImgNotify();
      return;
    }
    this.setState({
      ...this.state, person: {
        ...this.state.person,
        image: {
          isValid: true,
          value: files
        }
      }
    })
  }

  private tmpUrl_list: string[] = [];

  getTmpUrl(file: any): string {
    const tmUrl = URL.createObjectURL(file);
    this.tmpUrl_list.push(tmUrl);
    return tmUrl;
  }

  removeItemFromDZ(index: number/* , url: string */) {
    let newFiles = (this.state.person.image.value || []);
    if (newFiles) {
      newFiles.splice(index, 1);
    }
    this.setState({
      ...this.state, person: {
        ...this.state.person,
        image: {
          isValid: true,
          value: [...newFiles]
        }
      }
    })
  }
  //#endregion

  render() {
    return (
      <>
        <div className="profile-wrapper mt-3 mb-5">
          <div className="row">
            <div className="col-12">
              <div className="template-box--">

                <div className="row">
                  <div className="col-md-12 mb-3">
                    <h6 className="text-center">
                      <span className="text-muted">{Localization.username}:</span>&nbsp;
                      <span className="word-break-break-all">
                        {this.props.logged_in_user ? this.props.logged_in_user.username : ''}
                      </span>
                    </h6>
                    {/* <Input
                      label={Localization.username}
                      defaultValue={this.props.logged_in_user ? this.props.logged_in_user.username : ''}
                      readOnly
                    /> */}
                  </div>
                  <div className="col-md-6">
                    <Input
                      onChange={(value, isValid) => this.handleInputChange(value, isValid, "name")}
                      label={Localization.name}
                      placeholder={Localization.name}
                      defaultValue={this.state.person.name.value}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <Input
                      onChange={(value, isValid) => this.handleInputChange(value, isValid, 'last_name')}
                      label={Localization.lastname}
                      placeholder={Localization.lastname}
                      defaultValue={this.state.person.last_name.value}
                      required
                    />
                  </div>
                  <div className="col-md-12">
                    <Input
                      // onChange={(value, isValid) => this.handleInputChange(value, isValid, "cell_no")}
                      label={Localization.mobile}
                      // placeholder={Localization.mobile}
                      defaultValue={this.state.person.cell_no.value}
                      pattern={AppRegex.mobile}
                      // patternError={Localization.validation.mobileFormat}
                      readOnly
                    />
                  </div>
                  <div className="col-md-6">
                    <Input
                      onChange={(value, isValid) => this.handleInputChange(value, isValid, 'email')}
                      label={Localization.email}
                      placeholder={Localization.email}
                      defaultValue={this.state.person.email.value}
                      pattern={AppRegex.email}
                      patternError={Localization.validation.emailFormat}
                    />
                  </div>
                  <div className="col-md-6">
                    <Input
                      onChange={(value, isValid) => this.handleInputChange(value, isValid, "phone")}
                      label={Localization.phone}
                      placeholder={Localization.phone}
                      defaultValue={this.state.person.phone.value}
                      pattern={AppRegex.phone}
                      patternError={Localization.validation.phoneFormat}
                    />
                  </div>

                  <div className="col-12">
                    <div className="row">
                      <div className="col-md-12">
                        <Input
                          onChange={(value, isValid) => this.handleInputChange(value, isValid, "address")}
                          label={Localization.address}
                          placeholder={Localization.address}
                          is_textarea
                          defaultValue={this.state.person.address.value}
                        />
                      </div>
                      <div className="col-md-12">
                        <div className="app-dropzone">
                          <label htmlFor="">{Localization.profile_image}</label>
                          <div className="dropzone-container rounded py-3">
                            <Dropzone
                              multiple={false}
                              onDrop={(files) => this.onDrop(files)}
                              maxSize={5000000}
                              accept="image/*"
                              onDropRejected={(files, event) => this.onDropRejected(files, event)}
                            >
                              {
                                (({ getRootProps, getInputProps }) => (
                                  <section className="px-3">
                                    <div {...getRootProps({ className: 'dropzone' })}>
                                      <input {...getInputProps()} />
                                      <p
                                        className="drag-drop-section text-center text-muted p-3 mt-3-- mb-0 cursor-pointer rounded"
                                      >{Localization.choose_image}</p>
                                    </div>
                                    <aside className={
                                      "mt-3 " +
                                      (this.state.person.image.value && this.state.person.image.value.length
                                        ? '' : 'd-none')
                                    }>
                                      <h5 className="m-2">{Localization.preview}:</h5>
                                      <div className="file-wrapper px-2 pt-2 pb-0 rounded">{
                                        (this.state.person.image.value || []).map((file: any, index) => {
                                          let tmUrl = '';
                                          let fileName = '';
                                          let fileSize = '';
                                          if (typeof file === "string") {
                                            // fileName = file;
                                            tmUrl = '/api/serve-files/' + file;
                                          } else {
                                            fileName = file.name;
                                            fileSize = '- ' + parseFloat((file.size / 1024).toFixed(2)) + ' KB';
                                            tmUrl = this.getTmpUrl(file);
                                          }
                                          return <Fragment key={index}>
                                            <div className="file-item-row justify-content-center mb-2">
                                              <button title={Localization.remove}
                                                className="remove-file-btn btn btn-outline-danger btn-sm mr-2"
                                                onClick={() => this.removeItemFromDZ(index/* , tmUrl */)}
                                              >&times;</button>
                                              <div className="file-preview circle">
                                                {
                                                  (this.state.person.image.value)
                                                    ?
                                                    <img className="w-100px h-100px"
                                                      src={tmUrl}
                                                      alt=""
                                                      onError={e => this.personImageOnError(e)} />
                                                    :
                                                    <img className="w-50px h-50px"
                                                      src={this.defaultPersonImagePath} alt="" />
                                                }
                                              </div>
                                              <span className="ml-2 phone-text">{fileName} {fileSize}</span>
                                            </div>
                                          </Fragment>
                                        })
                                      }</div>
                                    </aside>
                                  </section>
                                ))
                              }
                            </Dropzone>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {
                  this.state.saveBtnVisibility ?
                    <div className="row mt-3">
                      <div className="col-12">
                        <BtnLoader
                          btnClassName="btn btn-primary btn-block"
                          loading={this.state.saveLoader}
                          onClick={() => this.update()}
                          disabled={!this.state.isFormValid || this.props.network_status === NETWORK_STATUS.OFFLINE}
                        >
                          {Localization.update}
                          {
                            this.props.network_status === NETWORK_STATUS.OFFLINE
                              ? <i className="fa fa-wifi text-danger"></i> : ''
                          }
                        </BtnLoader>
                      </div>
                    </div>
                    : ''
                }
              </div>
            </div>
          </div>
        </div>

        <ToastContainer {...this.getNotifyContainerConfig()} />
      </>
    );
  }
}

const dispatch2props: MapDispatchToProps<{}, {}> = (dispatch: Dispatch) => {
  return {
    onUserLoggedIn: (user: IUser) => dispatch(action_user_logged_in(user)),
  };
};

const state2props = (state: redux_state) => {
  return {
    logged_in_user: state.logged_in_user,
    internationalization: state.internationalization,
    token: state.token,
    network_status: state.network_status,
  };
};

export const Profile = connect(state2props, dispatch2props)(ProfileComponent);
