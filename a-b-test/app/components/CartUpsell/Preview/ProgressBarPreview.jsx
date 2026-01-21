import { getCurrencySymbol } from '../../../utils/currencyHelpers';

export default function ProgressBarPreview({ config, products, currencyCode, textColor }) {
  if (!config.enabled) return null;

  const currencySymbol = getCurrencySymbol(currencyCode);

  // Calculate current cart value for preview
  const currentValue = products && products.length > 0 
    ? (config.calculationType === 'cartTotal'
      ? products.reduce((sum, product) => sum + (parseFloat(product.price) || 0), 0)
      : products.length)
    : 0;
  
  const rewards = config.rewards || [];
  const sortedRewards = [...rewards].sort((a, b) => a.threshold - b.threshold);
  const maxThreshold = sortedRewards.length > 0 ? sortedRewards[sortedRewards.length - 1].threshold : 100;
  const progressPercentage = Math.min((currentValue / maxThreshold) * 100, 100);
  
  // Find next reward
  const nextReward = sortedRewards.find(r => r.threshold > currentValue);
  const allUnlocked = currentValue >= maxThreshold;
  
  return (
    <div style={{ padding: '12px 14px', borderBottom: '1px solid #e1e3e5', backgroundColor: '#fff' }}>
      {/* Progress message */}
      {sortedRewards.length > 0 && (
        <div style={{ marginBottom: '8px', fontSize: '11px', color: textColor, fontWeight: '500', textAlign: 'center' }}>
          {allUnlocked ? (
            <span dangerouslySetInnerHTML={{ __html: config.completionText }} />
          ) : nextReward ? (
            <span>
              {nextReward.progressText ? (
                nextReward.progressText
                  .replace('{{goal}}', config.calculationType === 'cartTotal' ? `${currencySymbol}${nextReward.threshold}` : `${nextReward.threshold}`)
                  .replace('{{amount_left}}', config.calculationType === 'cartTotal' ? `${currencySymbol}${(nextReward.threshold - currentValue).toFixed(2)}` : `${Math.ceil(nextReward.threshold - currentValue)}`)
              ) : (
                config.calculationType === 'cartTotal' 
                  ? `Add ${currencySymbol}${(nextReward.threshold - currentValue).toFixed(2)} more to unlock rewards!`
                  : `Add ${Math.ceil(nextReward.threshold - currentValue)} more item${Math.ceil(nextReward.threshold - currentValue) === 1 ? '' : 's'} to unlock rewards!`
              )}
            </span>
          ) : null}
        </div>
      )}
      
      {/* Progress bar with tiers */}
      <div style={{ position: 'relative', marginBottom: '10px' }}>
        <div style={{
          width: '100%',
          height: '6px',
          backgroundColor: config.backgroundColor,
          borderRadius: '3px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progressPercentage}%`,
            height: '100%',
            backgroundColor: config.barColor,
            transition: 'width 0.3s ease',
            borderRadius: '3px'
          }} />
        </div>
        
        {/* Tier markers */}
        {sortedRewards.map((reward) => {
          const position = (reward.threshold / maxThreshold) * 100;
          const isUnlocked = currentValue >= reward.threshold;
          
          return (
            <div
              key={reward.id}
              style={{
                position: 'absolute',
                left: `${position}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#fff',
                border: `2px solid ${isUnlocked ? config.completeIconColor : config.incompleteIconColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                color: isUnlocked ? config.completeIconColor : config.incompleteIconColor,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                cursor: 'default',
                zIndex: 2
              }}
              title={`${reward.rewardText || reward.description || 'Reward'} - ${config.calculationType === 'cartTotal' ? `${currencySymbol}${reward.threshold}` : `${reward.threshold} items`}`}
            >
              <span style={{ filter: isUnlocked ? 'none' : 'grayscale(1) brightness(0.4)', fontSize: '12px' }}>
                {isUnlocked ? '✓' : (reward.icon || '🎁')}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Tier labels */}
      {sortedRewards.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#999' }}>
          <span>{currencySymbol}0</span>
          {sortedRewards.map(reward => {
            const isUnlocked = currentValue >= reward.threshold;
            return (
              <span key={reward.id} style={{ 
                fontWeight: isUnlocked ? '600' : '400',
                color: isUnlocked ? config.completeIconColor : '#999',
                maxWidth: '60px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {reward.rewardText || reward.description || 'Reward'}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
