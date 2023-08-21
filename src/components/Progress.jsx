export default function Progress({
  index,
  numQuestions,
  points,
  totalPoints,
  answer,
}) {
  const progressCount = answer !== null ? index + 1 : index;
  return (
    <header className="progress">
      <progress value={progressCount} min={1} max={numQuestions}></progress>
      <p>
        Question <strong>{index + 1}</strong> / {numQuestions}
      </p>
      <p>
        <strong>{points}</strong>/{totalPoints}
      </p>
    </header>
  );
}
