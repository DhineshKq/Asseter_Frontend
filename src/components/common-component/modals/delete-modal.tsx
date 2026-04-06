import React, { useEffect, useState } from 'react';
import { RxCross1 } from 'react-icons/rx';
import ButtonComponent from '../form-elements/button-component';
import InputComponent from '../form-elements/input-component';
import Delete from "../../../assets/gif/delete.gif";
import { createPortal } from "react-dom";
import '../../../styles/modal/delete-modal.scss';
interface Styles {
  clearValue: (val: any) => void;
  getDelete?: () => void;
  modelType?: string;
  setResetPassword?: (val: any) => void;
  resetPassword?: string;
  handleSignOut?: () => void;
  handleConfirm?: () => void;
  userName?: string;
}

export default function DeleteModal({
  clearValue, getDelete, modelType, setResetPassword, resetPassword, userName, handleSignOut, handleConfirm
}: Styles) {
  const [storeRemarks, setStoreRemarks] = useState<string>("") // Remarks 
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        clearValue(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);


  return (
    <div className={"delete-modal"}>
      {
        modelType === "grid-delete" &&
        <div className={"container"}>
          <div className='delete-gif'></div>
          <div className={"title-head"}>{"Are you sure?"}</div>
          <div className={"content"}>{"Do you want to delete the record?"}
            <div>{"This process cannot be undone."}</div>
          </div>
          {
            userName &&
            <div className='delete-user-details'>
              {userName}
            </div>
          }
          <div className={"buttons"}>
            <ButtonComponent
              title={"Cancel"}
              height={"50px"}
              width={"150px"}
              backgroundColor={"#888888"}
              color={"white"}
              margin={"0px"}
              className={"button-component-hover cancel"}
              handleClick={() => clearValue(false)}
            />
            <ButtonComponent
              title={"Confirm"}
              height={"50px"}
              width={"150px"}
              backgroundColor={"var(--btn-primary-bg)"}
              color={"white"}
              margin={"0px"}
              className={"button-component-hover common-btn"}
              handleClick={() => { getDelete && getDelete() }}
            />
          </div>
        </div>
      }
      {
        modelType === "reset-password" &&
        <div className={"container"}>
          <div className={"title-head"} style={{ marginBottom: "10px" }}>{"Are you sure?"}</div>
          <div className={"content"}>
            {"Click confirm to generate new password for user."}
            <div>{"New password will be sent to user's registered email-id."}</div>
          </div>
          <div className='delete-user-details'>
            {userName}
          </div>
          <div className={"buttons"}>
            <ButtonComponent
              title={"Cancel"}
              height={"50px"}
              width={"150px"}
              backgroundColor={"#888888"}
              color={"white"}
              margin={"0px"}
              className={"button-component-hover cancel"}
              handleClick={() => clearValue(false)}
            />
            <ButtonComponent
              title={"Confirm"}
              height={"50px"}
              width={"150px"}
              backgroundColor={"#295285"}
              color={"white"}
              margin={"0px"}
              className={"button-component-hover common-btn"}
              handleClick={() => { getDelete && getDelete() }}
            />
          </div>
        </div>
      }
      {
        modelType === "grid-remark" &&
        <div className={"container"}>
          <div className={"close-icon"}>
            <span className={"cross-icon"}>
              <RxCross1 onClick={() => clearValue(false)
              } style={{ fontSize: "40px" }} />
            </span>
          </div>
          <div className={"title-head"}>{"Are you sure?"}</div>
          <div className={"content"}>{"A password reset link will be sent to user's registered email address."}</div>

          <InputComponent
            border={'1px solid #A9C3DC'}
            height={"40px"}
            width={"300px"}
            margin={"0px 0px 30px 0px"}
            padding={"0px 0px 0px 10px"}
            borderRadius={"0px"}
            backgroundColor={"white"}
            color={"black"}
            type={"text"}
            inputTitle={"Remarks"}
            required={true}
            placeHolder={"Reason"}
            inputValue={storeRemarks}
            points={""}
            maxLength={150}
            getUser={(value: any) => {
              setStoreRemarks(value)
            }}
          />
          <div className={"buttons"}>
            <ButtonComponent
              title={"Cancel"}
              height={"50px"}
              width={"150px"}
              backgroundColor={"#888888"}
              color={"white"}
              margin={"0px"}
              className={"button-component-hover cancel"}
              handleClick={() => clearValue(false)}
            />
            <ButtonComponent
              title={"Proceed"}
              height={"50px"}
              width={"150px"}
              backgroundColor={"#0055D4"}
              color={"white"}
              margin={"0px"}
              disabled={(storeRemarks !== "" && RegExp(/^[^\s].*/).test(storeRemarks)) ? false : true}
              className={storeRemarks !== "" && RegExp(/^[^\s].*/).test(storeRemarks) ? "button-component-hover common-btn" : "button-component disabled"}
              handleClick={() => {
                setResetPassword && setResetPassword(storeRemarks);
              }}
            />
          </div>
        </div>
      }

      {modelType === "profile-image" &&
        <div className={"container"}>
          <div className={"close-icon"}>
            <span className={"cross-icon"}>
              <RxCross1 onClick={() => clearValue(false)
              } style={{ fontSize: "40px" }} />
            </span>
          </div>
          <div className={"title-head"}>{"Are you sure?"}</div>
          <div className={"content"}>{"Do you want to delete your profile image? This process cannot be undone."}</div>
          <div className={"buttons"}>
            <ButtonComponent
              title={"Cancel"}
              height={"50px"}
              width={"150px"}
              backgroundColor={"#888888"}
              color={"white"}
              margin={"0px"}
              className={"button-component-hover cancel"}
              handleClick={() => clearValue(false)}
            />
            <ButtonComponent
              title={"Delete"}
              height={"50px"}
              width={"150px"}
              backgroundColor={"red"}
              color={"white"}
              margin={"0px"}
              className={"button-component-hover cancel"}
              handleClick={() => { getDelete && getDelete() }}
            />
          </div>
        </div>

      }
      {
        modelType === "signOut" &&
        createPortal(
          <div className="delete-modal">
            <div className="signout-shell">
              <button
                type="button"
                className="signout-close"
                onClick={() => clearValue(false)}
                aria-label="Close sign out dialog"
              >
                <RxCross1 />
              </button>

              <div className="signout-copy">
                <div className="signout-label">Logout</div>
                <div className="signout-content">
                  Are you sure you want to log out?
                </div>
                <div className="signout-subtext">
                  You will need to sign in again to access the workspace.
                </div>
              </div>

              <div className="buttons signout-actions">
                <ButtonComponent
                  title="Cancel"
                  height="48px"
                  width="160px"
                  backgroundColor="#E5E7EB"
                  color="#0F172A"
                  margin="0px"
                  className="button-component-hover cancel"
                  handleClick={() => clearValue(false)}
                />

                <ButtonComponent
                  title="Logout"
                  height="48px"
                  width="160px"
                  backgroundColor="#DC2626"
                  color="white"
                  margin="0px"
                  className="button-component common-btn"
                  handleClick={() => {
                    handleSignOut && handleSignOut();
                  }}
                />
              </div>
            </div>
          </div>,
          document.body
        )
      }
      {
        modelType === "profilPictureDelete" &&
        <div className={"profil-picture-container"}>
          <div className='signout-image-main'>
            <img className="profile-delete-image" src={Delete} alt="Delete profile illustration" />
          </div>
          <div className={"title-head"}>{"Are you sure?"}</div>
          <div className={"content"}>{"Do you want to delete the profile picture? This process cannot be undone."}</div>
          <div className={"buttons"}>
            <ButtonComponent
              title={"Cancel"}
              height={"50px"}
              width={"150px"}
              backgroundColor={"#888888"}
              color={"white"}
              margin={"0px"}
              className={"button-component-hover cancel"}
              handleClick={() => clearValue(false)}
            />
            <ButtonComponent
              title={"Confirm"}
              height={"50px"}
              width={"150px"}
              backgroundColor={"#295285"}
              color={"white"}
              margin={"0px"}
              className={'button-component common-btn'}
              handleClick={() => {
                handleConfirm && handleConfirm();
              }}
            />
          </div>
        </div>
      }
    </div>
  )
}
