import { useSelector } from "react-redux";
import { useRef, useState, useEffect } from "react";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from '../firebase';
import { updateUserStart, updateUserFailure, updateUserSuccess } from "../redux/user/userSlice";
import { useDispatch } from "react-redux";

export default function Profile() {
  const fileRef = useRef(null);
  const { currentUser } = useSelector(state => state.user);
  const [file, setFile] = useState(undefined);
  const [filePercentage, setPercentage] = useState(0);
  const [fileError, setFileError] = useState(false);
  const [formData, setFormData] = useState({});
  const dispatch = useDispatch();

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setPercentage(Math.round(progress));
      },
      (error) => {
        setFileError(true, error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFormData({ ...formData, avatar: downloadURL });
        });
      }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
        const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }
      dispatch(updateUserSuccess(data));
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  return (
    <>
      <div className="p-3 max-w-lg mx-auto">
        <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <input onChange={(e) => setFile(e.target.files[0])} type="file" ref={fileRef} accept="image/*" className="hidden" />
          <img
            className="rounded-full h-24 w-24 object-cover cursor-pointer self-center"
            src={formData.avatar || currentUser.avatar}
            alt="profile" onClick={() => fileRef.current.click()}
          />
          <p className="text-sm self-center">
            {fileError ? (
              <span className="text-red-700">Error Image Upload</span>
            ) : filePercentage > 0 && filePercentage < 100 ? (
              <span className="text-slate-700">{`Uploading ${filePercentage}`}</span>
            ) : filePercentage === 100 ? (
              <span className="text-green-700">Image successfully uploaded</span>
            ) : null
            }
          </p>
          <input
            className="border p-3 rounded-lg"
            type="text"
            placeholder="username"
            id="username"
            defaultValue={currentUser.username}
            onChange={handleChange}
          />
          <input className="border p-3 rounded-lg"
            type="text"
            placeholder="email"
            id="email"
            defaultValue={currentUser.email}
            onChange={handleChange}
          />
          <input className="border p-3 rounded-lg"
            type="text"
            placeholder="password"
            id="password"
            onChange={handleChange}
          />
          <button className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80">update</button>
        </form>
        <div className="flex justify-between mt-5">
          <span className="text-red-700 cursor-pointer">Delete Account</span>
          <span className="text-red-700 cursor-pointer">SignOut</span>
        </div>
      </div>
    </>
  );
}