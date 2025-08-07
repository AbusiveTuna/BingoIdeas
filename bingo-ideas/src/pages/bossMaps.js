import bosses from 'common/json/bosses.json';
import mobs   from 'common/json/mobs.json';
import raids  from 'common/json/raids.json';
import eras   from 'common/json/eras.json';

const bossEraMap = {};
eras.forEach(e =>
  (e.Content ?? []).forEach(entry => {
    if (entry.Boss) bossEraMap[entry.Boss] = e.Era;
  })
);

function buildMaps(list) {
  const categoryMap = {};
  const typeMap     = {};

  list.forEach(creature => {
    const categories = [...(creature.Categories ?? [])];
    categories.push(bossEraMap[creature.Boss] ?? 'OTHER');

    categories.forEach(cat => {
      (categoryMap[cat] ??= []).push(creature);
    });

    (creature.Drops ?? []).forEach(drop => {
      const baseRate = drop.DropRate ?? drop.ConditionalDropRate;
      const perItem  =
        drop.ConditionalDropRate && creature.PurpleChestRate
          ? creature.PurpleChestRate * drop.ConditionalDropRate
          : baseRate;
      const effHours = perItem / creature.EHB;

      const types = drop.Types?.length ? drop.Types : ['Other'];
      types.forEach(t =>
        (typeMap[t] ??= []).push({
          item:     drop.Item,
          type:     drop.Types?.join(', ') ?? '-',
          boss:     creature.Boss,
          dropRate: baseRate,
          ehb:      creature.EHB,
          eff:      effHours.toFixed(1),
        })
      );
    });
  });

  return { categoryMap, typeMap };
}

export const bossesMaps   = buildMaps(bosses);
export const mobsMaps     = buildMaps(mobs);
export const raidsMaps    = buildMaps(raids);
export const combinedMaps = buildMaps([...bosses, ...mobs, ...raids]);
