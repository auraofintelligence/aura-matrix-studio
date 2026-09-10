import unittest
from build_market_data import name_match, category_for

class MarketFilterTests(unittest.TestCase):
    def test_search_results_must_match_the_actual_name(self):
        for name in ['Aura Hotel','AURORA Cafe','Chakra Centre','Gajra','Yoga Studio','Tai-Chi School','Taichí PAI']:
            self.assertTrue(name_match(name),name)
        for name in ['El Aurassi Hotel','Restaurant Algerien','Laura Designs','Gimnasio Tak','Aurax store']:
            self.assertFalse(name_match(name),name)

    def test_categories_do_not_match_fragments_or_repeat_bad_source_labels(self):
        self.assertEqual(category_for('Aura Restaurant','Creative Industries','affinity')[0],'other')
        self.assertEqual(category_for('Aura Planning','Accommodation','affinity')[0],'other')
        self.assertEqual(category_for('Aura Apartments','Creative Industries','affinity')[0],'accommodation')
        self.assertEqual(category_for('Aura Gallery','Other','affinity')[0],'creative')
        self.assertEqual(category_for('Arriva Aura','Hotels','alliance')[0],'accommodation')

if __name__=='__main__':unittest.main()
