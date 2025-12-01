export const defaultStrategy = (allScoreMetrics) => {
  const {
    debt,
    currentRatio,
    anualisedEPS,
    anualisedFCF,
    revenueG,
    shareDilution,
    lastFiveYearsROIC,
    netCashPerShare,
    cashConversion,
    growOperatingMargin,
    growGrossMargin,
    growRoic,
    medianPayoutRatio,
    tenYearsDividendGrowth
  } = allScoreMetrics

  const isPayoutRatioPresent = medianPayoutRatio !== null

  const scoreRules = [
    {
      condition: () => currentRatio > 2,
      score: 7.5
    },
    {
      condition: () => currentRatio > 1.5 && currentRatio <= 2,
      score: 5
    },
    {
      condition: () => currentRatio > 1 && currentRatio <= 1.5,
      score: 2.5
    },
    {
      condition: () => currentRatio > 0.8 && currentRatio <= 1,
      score: 1.25
    },
    {
      condition: () => netCashPerShare >= 0,
      score: 5
    },
    {
      condition: () => debt < 1.5,
      score: 7.5
    },
    {
      condition: () => debt > 1.5 && debt < 2,
      score: 5
    },
    {
      condition: () => debt > 2.5 && debt <= 3,
      score: 2.5
    },
    {
      condition: () => Number(lastFiveYearsROIC) >= 15,
      score: 15
    },
    {
      condition: () => Number(lastFiveYearsROIC) < 15 && Number(lastFiveYearsROIC) > 12,
      score: 12.5
    },
    {
      condition: () => Number(lastFiveYearsROIC) < 12 && Number(lastFiveYearsROIC) > 10,
      score: 10
    },
    {
      condition: () => shareDilution <= 0,
      score: 10
    },
    {
      condition: () => shareDilution > 0 && shareDilution <= 0.1,
      score: 7.5
    },
    {
      condition: () => shareDilution > 0.1 && shareDilution <= 0.2,
      score: 5
    },
    {
      condition: () => shareDilution > 0.2 && shareDilution <= 0.4,
      score: 2.25
    },
    {
      condition: () => cashConversion > 88,
      score: 5
    },
    {
      condition: () => ['Positive', 'Neutral'].includes(growRoic),
      score: 7.5
    },
    {
      condition: () => ['Positive', 'Neutral'].includes(growGrossMargin),
      score: 7.5
    },
    {
      condition: () => ['Positive', 'Neutral'].includes(growOperatingMargin),
      score: 7.5
    },
    {
      condition: () => anualisedEPS === 'NaN' || anualisedEPS === null,
      score: isPayoutRatioPresent ? 5 : 10
    },
    {
      condition: () => anualisedEPS >= 8,
      score: isPayoutRatioPresent ? 5 : 10
    },
    {
      condition: () => anualisedEPS > 7 && anualisedEPS < 8,
      score: isPayoutRatioPresent ? 2.5 : 5
    },
    {
      condition: () => anualisedEPS > 6 && anualisedEPS < 7,
      score: isPayoutRatioPresent ? 1.25 : 2.5
    },
    {
      condition: () => anualisedFCF === 'NaN' || anualisedFCF === null,
      score: isPayoutRatioPresent ? 5 : 10
    },
    {
      condition: () => anualisedFCF >= 8,
      score: isPayoutRatioPresent ? 5 : 10
    },
    {
      condition: () => anualisedFCF > 7 && anualisedFCF < 8,
      score: isPayoutRatioPresent ? 2.5 : 5
    },
    {
      condition: () => anualisedFCF > 6 && anualisedFCF < 7,
      score: isPayoutRatioPresent ? 1.25 : 2.5
    },
    {
      condition: () => revenueG === 'NaN' || revenueG === null,
      score: isPayoutRatioPresent ? 5 : 7.5
    },
    {
      condition: () => revenueG >= 8,
      score: isPayoutRatioPresent ? 5 : 7.5
    },
    {
      condition: () => revenueG > 7 && revenueG < 8,
      score: isPayoutRatioPresent ? 2.5 : 5
    },
    {
      condition: () => revenueG > 6 && revenueG < 7,
      score: isPayoutRatioPresent ? 1.25 : 2.5
    }
  ]

  const payoutRatioSpecificRules = [
    {
      condition: () => medianPayoutRatio <= 0.4 && medianPayoutRatio >= 0,
      score: 7.5
    },
    {
      condition: () => medianPayoutRatio <= 0.55 && medianPayoutRatio > 0.4,
      score: 5
    },
    {
      condition: () => medianPayoutRatio <= 0.65 && medianPayoutRatio > 0.55,
      score: 2.5
    },
    {
      condition: () => tenYearsDividendGrowth === 'NaN' || anualisedEPS === null,
      score: 5
    },
    {
      condition: () => tenYearsDividendGrowth >= 8,
      score: 5
    },
    {
      condition: () => tenYearsDividendGrowth > 7 && tenYearsDividendGrowth < 8,
      score: 2.5
    },
    {
      condition: () => tenYearsDividendGrowth > 6 && tenYearsDividendGrowth < 7,
      score: 1.25
    }
  ]

  // Combinar todas las reglas
  const allRules = [
    ...scoreRules,
    ...(medianPayoutRatio ? payoutRatioSpecificRules : [])
  ]

  // Calcular puntuación total
  return allRules.reduce((totalScore, rule) => {
    return rule.condition() ? totalScore + rule.score : totalScore
  }, 0)
}
