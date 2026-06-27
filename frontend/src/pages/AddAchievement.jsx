import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

const AddAchievement = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/achievements", form);
      alert("Achievement added");
      navigate("/dashboard");
    } catch (error) {
      alert("Error adding achievement");
    }
  };

  return (
    <div>
      <h2>Add Achievement</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Title"
          onChange={(e) =>
            setForm({ ...form, title: e.target.value })
          }
        />
        <br />

        <input
          placeholder="Description"
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />
        <br />

        <input
          placeholder="Category"
          onChange={(e) =>
            setForm({ ...form, category: e.target.value })
          }
        />
        <br />

        <button type="submit">Add</button>
      </form>
    </div>
  );
};

export default AddAchievement;