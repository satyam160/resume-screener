export default function SkillTag({ label, matched }) {
  return (
    <span className={`skill-tag ${matched ? 'matched' : 'missing'}`}>
      {matched ? '●' : '○'} {label}
    </span>
  );
}
