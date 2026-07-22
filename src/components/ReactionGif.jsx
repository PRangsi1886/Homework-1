import { getReactionForScore } from '../lib/reactionGif'

export default function ReactionGif({ score, subtitle }) {
  const reaction = getReactionForScore(score)

  return (
    <div className="reaction-gif-card" aria-label={`Reaction score ${reaction.score} out of 100`}>
      <img
        src={reaction.gif}
        alt=""
        className="reaction-gif-img"
        loading="lazy"
      />
      <div className="reaction-gif-meta">
        <span className="reaction-gif-emoji" aria-hidden="true">{reaction.emoji}</span>
        <div>
          <p className="reaction-gif-label">{reaction.label}</p>
          <p className="reaction-gif-score">Reaction score: {reaction.score}/100</p>
          {subtitle && <p className="reaction-gif-sub">{subtitle}</p>}
        </div>
      </div>
    </div>
  )
}
