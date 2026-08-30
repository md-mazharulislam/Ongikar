import { useEffect, useState } from "react";
import api from "../api/axios";
import Loader from "../components/Loader";
import "./Settings.css";
import "./Management.css";

const CATEGORY_LABEL = {
  founder: "প্রতিষ্ঠাতা",
  "co-founder": "সহ-প্রতিষ্ঠাতা",
  advisor: "উপদেষ্টা",
  team: "টিম সদস্য",
  volunteer: "স্বেচ্ছাসেবক",
};

const CATEGORY_ORDER = ["founder", "co-founder", "advisor", "team", "volunteer"];

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

function MemberCard({ member }) {
  return (
    <div className="mgmt-card">
      <div className="mgmt-photo">
        {member.photo ? (
          <img src={member.photo} alt={member.name} />
        ) : (
          <div className="mgmt-photo-fallback">{initials(member.name)}</div>
        )}
      </div>
      <h3 className="mgmt-name">{member.name}</h3>
      <span className="mgmt-role">{member.designationBn}</span>
      {member.bio && <p className="mgmt-bio">{member.bio}</p>}
      {(member.facebook || member.linkedin || member.email) && (
        <div className="mgmt-social">
          {member.facebook && (
            <a href={member.facebook} target="_blank" rel="noreferrer" title="Facebook">
              <i className="fa-brands fa-facebook-f"></i>
            </a>
          )}
          {member.linkedin && (
            <a href={member.linkedin} target="_blank" rel="noreferrer" title="LinkedIn">
              <i className="fa-brands fa-linkedin-in"></i>
            </a>
          )}
          {member.email && (
            <a href={`mailto:${member.email}`} title="Email">
              <i className="fa-solid fa-envelope"></i>
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default function Management() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/management")
      .then(({ data }) => setMembers(data.members))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="ম্যানেজমেন্ট তথ্য লোড হচ্ছে..." />;

  const grouped = CATEGORY_ORDER.map((cat) => ({
    cat,
    list: members.filter((m) => m.category === cat),
  })).filter((g) => g.list.length > 0);

  return (
    <div className="page-w">
      <h1 className="page-title">ম্যানেজমেন্ট</h1>
      <p className="page-description">যাদের হাত ধরে অঙ্গীকার প্রতিষ্ঠিত ও পরিচালিত হচ্ছে।</p>

      {grouped.length === 0 && (
        <p className="muted">এখনও কোনো ম্যানেজমেন্ট তথ্য যোগ করা হয়নি।</p>
      )}

      {grouped.map((g) => (
        <div className="mgmt-section" key={g.cat}>
          <h2 className="mgmt-section-title">
            <span className="seal"><i className="fa-solid fa-users"></i></span>
            {CATEGORY_LABEL[g.cat] || g.cat}
          </h2>
          <div className="mgmt-grid">
            {g.list.map((m) => (
              <MemberCard member={m} key={m._id} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
