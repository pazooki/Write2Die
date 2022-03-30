﻿## In this project, I want to download history data and make a dataset for the Tehran Stock Exchange (TSE). TSE dont share all data into internet free

## Iran stock websites:
- [بورس اوراق بهادار تهران](http://tse.ir/)
- [پایگاه خبری بازار سرمایه ایران](http://www.sena.ir/)
- [سامانه جامع اطلاع رسانی ناشران](https://www.codal.ir/)
- [سازمان بورس و اوراق](https://www.seo.ir/)
- [قیمت های بورس](http://www.tsetmc.com)

## Example
For test select bank melat symbol:

[Main Page](http://www.tsetmc.com/Loader.aspx?ParTree=15)
[بانك ملت (وبملت)](http://www.tsetmc.com/Loader.aspx?ParTree=151311&i=778253364357513#)

	Bank Melat SYMBOL_ID = 778253364357513


### Today Data
	URI
	http://www.tsetmc.com/Loader.aspx?ParTree=151311&i=SYMBOL_ID

	Sample
	http://www.tsetmc.com/Loader.aspx?ParTree=151311&i=778253364357513

### Get History Data
	URI
	http://cdn.tsetmc.com/Loader.aspx?ParTree=15131P&i=SYMBOL_ID&d=YEAR,MONTH,DAY
	Sample:
	http://cdn.tsetmc.com/Loader.aspx?ParTree=15131P&i=778253364357513&d=20180212

The TSETMC website developers use a javascript function with name ens for adding javascript files into HTML document.

Three javascript files used for handled HTML functionality:
- http://cdn.tsetmc.com/tsev2/res/loader.aspx?t=j&_443
- http://cdn.tsetmc.com/tsev2/res/loader.aspx?t=s&_443 
- http://cdn.tsetmc.com/tsev2/res/loader.aspx?t=h&_443

In the HTML document, defined different variables are used in javascript functions

	//[+]OneDay function
	var InstSimpleData = [
			0 'بانك ملت',		**SYMBOL_NAME** (نام سهام)
			1 'وبملت',			**SYMBOL** (کد سهام)
			2 'بازار بورس',
			3 'بازار اول (تابلوي اصلي) بورس',	**TABLEAU** (بازار)
			4 1,				** ??? ***
			5 'N1',				** ??? ***
			6 'IRO1BMLT0007',   ** SYMBOL_UID ** (شناسه لاتین سهم)
			7 'IRO1BMLT0001',   ** ??? **
			8 50000000000,		**SHARE_KOL** (تعداد سهام)
			9 9569378			**VALUEM_BASE** (حجم مبنا)
			];
	var LVal30         = InstSimpleData[0]; SYMBOL_NAME, 	#d15
	var LVal18AFC      = InstSimpleData[1]; SYMBOL, 		#d16
	var FlowName       = InstSimpleData[3]; TABLEAU, 		#d17
	var Flow           = InstSimpleData[4]; **???***
	var CgrValCot      = InstSimpleData[5]; **???***
	var InstrumentID   = InstSimpleData[7]; **???***
	var ZTitad         = InstSimpleData[8]; SHARE_KOL,		#d18
	var BaseVol        = InstSimpleData[9]; VALUEM_BASE, 	#d19
	var InsCode        = '778253364357513'; **SYMBOL_ID**
	var CIsin          = '';
	var PdrCotVal      = '';
	var PClosing       = ''; 
	var DEven          = '20180212'; **DATE**

	//[?] Check another share
	// ii.OneDayTH
	var StaticTreshholdData =[
				    قیمت مجاز
			    ---------------
		[    1, 1097.00, 993.00],
		[60124, 1097.00, 993.00]
	];

	// ii.OneDayCP
	var ClosingPriceData = [
		C1	LAST Price
		C2	LAST Price (Close)
		C3	First Price (Open)
		C4	Before day price

		 DateTime               X   C1     C2     C3     C4     Low    High  ID   C5       C6
		['1396/11/23 06:10:47','-','1046','1045',   '0','1045',   '0',   '0','0',   '0',       '0', '0','61047'],
		['1396/11/23 09:00:10','-','1045','1045','1045','1045','1045','1045','1','2830', '2957350', '0','90010'],
		['1396/11/23 09:08:13','-','1040','1045','1045','1045','1045','1040','2','32230','33533350','0','90813'],
		['1396/11/23 09:12:07','-','1040','1045','1045','1045','1045','1040','3','33230','34573350','0','91207'],
		['1396/11/23 09:12:19','-','1040','1045','1045','1045','1045','1040','4','33240','34583750','0','91219'],
		['1396/11/23 09:19:52','-','1040','1045','1045','1045','1045','1040','5','39830','41437350','0','91952'],
		['1396/11/23 09:19:52','-','1040','1045','1045','1045','1045','1040','6','44830','46637350','0','91952'],
		['1396/11/23 09:19:52','-','1040','1045','1045','1045','1045','1040','7','45740','47583750','0','91952'],
		['1396/11/23 09:21:17','-','1044','1045','1045','1045','1045','1040','8','46420','48293670','0','92117'],
		...
	]

	var IntraDayPriceData=[
			['09:00',1045,1040,1045,1040,32230  ],
			['09:12',1040,1040,1040,1040,13510  ],
			['09:21',1044,1040,1044,1040,137299 ],
			['09:33',1040,1033,1040,1036,99436  ],
			['09:40',1035,1033,1035,1035,126000 ],
			['09:53',1035,1035,1035,1035,19580  ],
			['10:04',1039,1035,1039,1039,9000   ],
			['10:14',1040,1039,1039,1039,600000 ],
			['10:22',1040,1040,1040,1040,446312 ],
			['10:32',1040,1037,1037,1037,39536  ],
			['10:42',1040,1037,1037,1038,31722  ],
			['10:52',1037,1036,1037,1036,155322 ],
			['11:14',1036,1035,1036,1035,140313 ],
			['11:20',1035,1034,1035,1034,570913 ],
			['11:30',1036,1034,1036,1036,50000  ],
			['11:47',1036,1034,1035,1034,11224  ],
			['11:56',1035,1033,1035,1033,140000 ],
			['12:07',1035,1030,1035,1031,1438218],
			['12:16',1036,1031,1035,1032,510201 ]
		];

	// ii.OneDayIS
	var InstrumentStateData = [[20170820,1,'A ']];

	// ?, With this variable, BuildGrid function try to build table, and this table not show in this document
	// ii.OneDayIT
	var IntraTradeData = [
		['1', '09:00:14', '2830','1045',0],
		['2', '09:08:18','29400','1040',0],
		['3', '09:12:12', '1000','1040',0],
		['4', '09:12:24',   '10','1040',0],
		['5', '09:19:57', '6590','1040',0],
		['6', '09:19:57', '5000','1040',0],
		['7', '09:19:57',  '910','1040',0],
		['8', '09:21:22',  '680','1044',0],
		['9', '09:22:04', '6320','1044',0],
		['10','09:23:52', '1429','1043',0],
		['11','09:24:05', '2000','1041',0],
		['12','09:24:05', '3870','1040',0],
		['13','09:24:05','94130','1040',0],
		...
		['24','09:41:10','25000','1035',0],
		['25','09:45:31','12500','1035',0]
	];

	// ii.OneDaySH
	var ShareHolderData=[
			[
				44141, 						**SHAREHOLDER_ID**
				'IRO1BMLT0007',				**SYMBOL_UID**
				8499999996, 				**SHARE**
				16.990, 					**SHARE_PERCENT**
				'', 						** SHARE_CHANGE [ArrowUp, Arrow??, ???] **
				'دولت جمهوري اسلامي ايران' **SHAREHOLDER_NAME**
			],
			[
				965,
				'IRO1BMLT0007',
				2499999999,
				4.990,
				'',
				'صندوق تامين آتيه كاركنان بانك ملت'
			],
			[
				490,
				'IRO1BMLT0007',
				2111338711,
				4.220,
				'',
				'شركت سرمايه گذاري صباتامين-سهامي عام-'
			],
			[
				99,
				'IRO1BMLT0007',
				1904782481,
				3.800,
				'',
				'سازمان تامين اجتماعي'
			],
			[
				1064,
				'IRO1BMLT0007',
				1525595446,
				3.050,
				'',
				'شركت س اتهران س.خ-م ك م ف ع-'
			],
			[
				21470,
				'IRO1BMLT0007',
				1450719028,
				2.900,
				'',
				'شركت تعاوني معين آتيه خواهان'
			],
			[
				44378,
				'IRO1BMLT0007',
				1326987218,
				2.650,
				'ArrowUp',
				'BFMصندوق سرمايه گذاري.ا.بازارگرداني ملت'
			],
			[
				1065,
				'IRO1BMLT0007',
				1217728923,
				2.430,
				'',
				'شركت س اخراسان رضوي س.خ-م ك م ف ع-'
			],
			[
				2674,
				'IRO1BMLT0007',
				1032597703,
				2.060,
				'',
				'شركت س افارس س.خ-م ك م ف ع-'
			],
			[
				8113,
				'IRO1BMLT0007',
				1030785229,
				2.060,
				'ArrowUp',
				'شركت گروه مالي ملت-سهام عام-'
			],
			[
				44516,
				'IRO1BMLT0007',
				952360382,
				1.900,
				'',
				'شركت سرمايه گذاري مدبران اقتصاد-سهامي خاص-'
			],
			[
				1063,
				'IRO1BMLT0007',
				941458365,
				1.880,
				'',
				'شركت س ااصفهان س.خ-م ك م ف ع-'
			],
			[
				2662,
				'IRO1BMLT0007',
				921606612,
				1.840,
				'',
				'شركت س اخوزستان س.خ-م ك م ف ع-'
			],
			[
				22399,
				'IRO1BMLT0007',
				863131153,
				1.720,
				'',
				'شركت گروه مالي ملت-سهامي عام-بخش1'
			],
			[
				21630,
				'IRO1BMLT0007',
				792000000,
				1.580,
				'',
				'شركت گروه توسعه مالي مهرآيندگان-سهامي عام-'
			],
		];

	// ii.OneDaySY
	var ShareHolderDataYesterday =[
		[
			**Like ShareHolderData**
			44141, 	'IRO1BMLT0007',8499999996,16.990,'','دولت جمهوري اسلامي ايران'
			965,  	'IRO1BMLT0007', 2499999999,4.990,'','صندوق تامين آتيه كاركنان بانك ملت'
			490,	'IRO1BMLT0007', 2111338711,4.220,'','شركت سرمايه گذاري صباتامين-سهامي عام-'
			99,		'IRO1BMLT0007', 1904782481,3.800,'','سازمان تامين اجتماعي'
			1064,	'IRO1BMLT0007', 1525595446,3.050,'','شركت س اتهران س.خ-م ك م ف ع-'
			21470,	'IRO1BMLT0007', 1450719028,2.900,'','شركت تعاوني معين آتيه خواهان'
			44378,	'IRO1BMLT0007', 1326656283,2.650,'ArrowUp','BFMصندوق سرمايه گذاري.ا.بازارگرداني ملت'
			1065,	'IRO1BMLT0007', 1217728923,2.430,'','شركت س اخراسان رضوي س.خ-م ك م ف ع-'
			2674,	'IRO1BMLT0007', 1032597703,2.060,'','شركت س افارس س.خ-م ك م ف ع-'
			8113,	'IRO1BMLT0007', 1030492460,2.060,'ArrowUp','شركت گروه مالي ملت-سهام عام-'
			44516,	'IRO1BMLT0007',  952360382,1.900,'','شركت سرمايه گذاري مدبران اقتصاد-سهامي خاص-'
			1063,	'IRO1BMLT0007',  941458365,1.880,'','شركت س ااصفهان س.خ-م ك م ف ع-'
			2662,	'IRO1BMLT0007',  921606612,1.840,'','شركت س اخوزستان س.خ-م ك م ف ع-'
			22399,	'IRO1BMLT0007',  863131153,1.720,'','شركت گروه مالي ملت-سهامي عام-بخش1'
			21630,	'IRO1BMLT0007',  792000000,1.580,'','شركت گروه توسعه مالي مهرآيندگان-سهامي عام-'
			2663,	'IRO1BMLT0007',  777907910,1.550,'','شركت س اآذربايجان شرقي س.خ-م ك م ف ع-'
			2675,	'IRO1BMLT0007',  725746772,1.450,'','شركت س امازندران س.خ-م ك م ف ع-'
			21318,	'IRO1BMLT0007',  724703140,1.440,'','صندوق تامين آتيه كاركنان بانك ملت-بخش1دارايي-'
			307,	'IRO1BMLT0007',  720612912,1.440,'','شركت پخش سراسري ايران سهامي خاص'
			2665,	'IRO1BMLT0007',  707520623,1.410,'','شركت س اكرمان س.خ-م ك م ف ع-'
			20910,	'IRO1BMLT0007',  705298757,1.410,'','صندوق سرمايه گذاري يكم كارگزاري بانك كشاورزي'
			2666,	'IRO1BMLT0007',  654789078,1.300,'','شركت س اگيلان س.خ-م ك م ف ع-'
			20062,	'IRO1BMLT0007',  612630346,1.220,'','شركت سرمايه گذاري اهداف-سهامي عام-'
			48471,	'IRO1BMLT0007',  604246528,1.200,'','شركت شيرين عسل-سهامي خاص-'
			527,	'IRO1BMLT0007',  570657471,1.140,'','شركت سرمايه گذاري ملي ايران-سهامي عام-'
			2676,	'IRO1BMLT0007',  567032348,1.130,'','شركت س اآذربايجان غربي س.خ-م ك م ف ع-'
			2667,	'IRO1BMLT0007',  547327808,1.090,'','شركت س اسيستان وبلوچستان س.خ-م ك م ف ع-'
		];

	Get this URI return the shareHolder details info
	http://cdn.tsetmc.com/tsev2/data/ShareHolder.aspx?i=22366%2CIRO1SIPA0001

	var ClientTypeData=[
			//خرید حقیقی و حقوقی - نفر
			53,3,
			//فروش حقیقی و حقوقی - نفر
			38,7,

			// حجم خرید حقیقی و حقوقی
			2468047,2223704,
			// حجم فروش حقیقی و حقوقی
			2978681,1713070,

			// درصد حجم خرید حقیقی و حقوقی
			53,47,
			// درصد حجم فروش حقیقی و حقوقی
			63,37,

			// ارزش خرید حقیقی و حقوقی
			2553524405, 2302566759,
			// ارزش فروش حقیقی و حقوقی
			3080842447,1775248717,

			// قیمت میانگین خرید حقیقی و حقوقی
			1034.6336212397900039991134691,1035.4645937588815777639470001,
			// قیمت میانگین فروش حقیقی و حقوقی
			1034.297545457200687149782068,1036.2966586304120672243399277,

			// تغییر مالکیت حقوقی به حقیقی
			-510634
		];

	// SetBestLimitsLastUpdatedTimes function
	// ii.OneDayBL
	var BestLimitData = [
					    Buyer               Seller
					-----------------  -----------------
				Seq cnt    vol    price  price     vol   cnt
		[60124,	'1','1',  '3000','1031','1050',  '3000','1'],
		[60124,	'2','1',  '5000','1022','1055',  '3000','1'],
		[60124,	'3','3', '86998','1021','1060', '23000','2'],
		[60124,	'4','2','101000','1020','1065',  '3000','1'],
		[60124,	'5','1',  '2601','1018','1070', '13000','2'],

		[83059,	'1','1',  '3000','1031','1050', '15500','2'],

		[83228,	'4','2','101000','1020','1065', '15900','2'],

		[83246,	'4','2','101000','1020','1065', '25900','3'],

		[83258,	'1','1',  '2830','1050','1050', '15500','2'],
		[83258,	'2','1',  '3000','1031','1055',  '3000','1'],
		[83258,	'3','1',  '5000','1022','1060', '23000','2'],
		[83258,	'4','3', '86998','1021','1065', '25900','3'],
		[83258,	'5','2','101000','1020','1070', '13000','2'],

		[83326,	'5','2','101000','1020','1070','113000','3'],

		[83330,	'5','2','101000','1020','1070','213000','4'],

		[83342,	'3','1',  '4000','1025','1060', '23000','2'],
		[83342,	'4','1',  '5000','1022','1065', '25900','3'],
		[83342,	'5','3', '86998','1021','1070','213000','4'],

		[83439,	'2','1',  '4000','1035','1055',  '3000','1'],
		[83439,	'3','1',  '3000','1031','1060', '23000','2'],
		[83439,	'4','1',  '4000','1025','1065', '25900','3'],
		[83439,	'5','1',  '5000','1022','1070','213000','4'],

		[83557,	'2','1',  '4000','1035','1055', '12999','2'],

		[83710,	'5','1',  '5000','1022','1069', '28346','1'],

		[83817,	'1','1',  '2830','1045','1045','100000','1'],
		[83817,	'2','1',  '4000','1035','1050', '15500','2'],
		[83817,	'3','1',  '3000','1031','1055', '12999','2'],
		[83817,	'4','1',  '4000','1025','1060', '23000','2'],
		[83817,	'5','1',  '5000','1022','1065', '25900','3'],
		...
		[134017, 	'4','1','10000','1029','1049', '10000','1'],
		[134017,	'5','1','10000','1028','1050','200583','8']
	]; 

### Javascript Files
	ii.OneDayTH = StaticTreshholdData
	ii.OneDayIS = InstrumentStateData
	ii.OneDayIT = IntraTradeData
	ii.OneDaySH = ShareHolderData
	ii.OneDaySY = ShareHolderDataYesterday


### Instrument Listing
- [Symbol List](http://tse.ir/listing.html)
- [Symbol List JSON - Cash نقد](http://tse.ir/json/Listing/ListingByName1.json)
- [Symbol List JSON - Future آتی](http://tse.ir/json/Listing/ListingByName2.json)
- [Symbol List JSON - Option تبعی](http://tse.ir/json/Listing/ListingByName3.json)
- [Symbol List JSON - Debt بدهی](http://tse.ir/json/Listing/ListingByName4.json)
- [Symbol List JSON - ETF](http://tse.ir/json/Listing/ListingByName5.json)
- [Symbol List JSON - tradeOption اختیار](http://tse.ir/json/Listing/ListingByName7.json)

**Cash**
	{
		"companies":
			[
				{
					"l":"آ",
					"list":[
							{
								"n":"آبسال‌",
								"sy":"لابسا1",
								"s":"A",
								"ic":"IRO1ASAL0001"
							},
							{"n":"آسان پرداخت پرشين","sy":"آپ1","s":"A","ic":"IRO1APPE0001"},
							{"n":"آلومراد","sy":"فمراد1","s":"A","ic":"IRO1ALMR0001"},
							{
								"n":"آلومينيوم‌ايران‌",
								"sy":"فايرا1",
								"s":"A",
								"ic":"IRO1ALIR0001"
							},
							{
								"n":"آهنگري‌ تراكتورسازي‌ ايران‌",
								"sy":"خاهن1",
								"s":"IS",
								"ic":"IRO1ATIR0001"
							}
							]
				},
				{
					"l":"ا",
					"list":[
							{"n":"افست‌","sy":"چافست1","s":"A","ic":"IRO1OFST0001"},
							{"n":"البرزدارو","sy":"دالبر1","s":"A","ic":"IRO1DALZ0001"},
							{"n":"الكتريك‌ خودرو شرق‌","sy":"خشرق1","s":"A","ic":"IRO1KHSH0001"},
							{"n":"ايران‌ تاير","sy":"پتاير1","s":"A","ic":"IRO1TAIR0001"},
							{"n":"ايران‌ ترانسفو","sy":"بترانس1","s":"A","ic":"IRO1TRNS0001"},
							{"n":"ايران‌ خودرو","sy":"خودرو1","s":"A","ic":"IRO1IKCO0001"},
							{"n":"ايران‌ خودروديزل‌","sy":"خاور1","s":"IS","ic":"IRO1KAVR0001"},
							{"n":"ايران‌ مرينوس‌","sy":"نمرينو1","s":"A","ic":"IRO1MRIN0001"},
							{"n":"ايران‌ارقام‌","sy":"مرقام1","s":"A","ic":"IRO1IAGM0001"},
							{"n":"ايران‌دارو","sy":"ديران1","s":"A","ic":"IRO1IRDR0001"},
							{"n":"ايران‌ياساتايرورابر","sy":"پاسا1","s":"A","ic":"IRO1YASA0001"},
							{"n":"ايركا پارت صنعت","sy":"خكار1","s":"A","ic":"IRO1KRIR0001"}
							]
				},
				{
					"l":"ب",
					"list":[
							{"n":"باما","sy":"كاما1","s":"A","ic":"IRO1BAMA0001"},
							{"n":"بانك  پاسارگاد","sy":"وپاسار1","s":"A","ic":"IRO1BPAS0001"},
							{"n":"بانك انصار","sy":"وانصار1","s":"IS","ic":"IRO1BANS0001"},
							{"n":"بانك تجارت","sy":"وتجارت1","s":"A","ic":"IRO1BTEJ0001"},
							{"n":"بانك خاورميانه","sy":"وخاور1","s":"A","ic":"IRO1BKHZ0001"}
							]
				}
			]
	}

## Instrument Basic Information
- [Link](http://tse.ir/instrument/%D9%88%D8%A8%D9%85%D9%84%D8%AA1_IRO1BMLT0001.html)

**Company State**
- [Link](http://service.tse.ir/api/CompanyState?instId=IRO1BMLT0001)
	{
		"InstrumentId":"IRO1BMLT0001",
		"CompanyName":"بانک ملت",
		"Status":"عادی",
		"StatusCode":"0",
		"Reasons":"",
		"Description":null,
		"UpdateDateTime":"2018-08-18T08:31:43.7419427"
	}

**Basic Info**
- [Link](http://tse.ir/json/Instrument/BasicInfo/BasicInfo_IRO1BMLT0001.html)

	کد ISIN	
	نام شرکت	
	نماد فارسی	
	نام انگلیسی شرکت	
	نماد انگلیسی	
	کد CISIN	
	تابلو
	صنعت
	کد صنعت	
	زیر گروه صنعت	
	کد زیر گروه صنعت	

**Instrument History**
- [Link](http://tse.ir/json/Instrument/TradeHistory/TradeHistory_IRO1BMLT0001.html?updated=1550087108362)
**Info**
- [Link](http://tse.ir/json/Instrument/info_IRO1BMLT0001.json)
**Price Plot**
- [Link](http://tse.ir/json/Instrument/plot_IRO1ALIR0001.json)

**MArket Watch**
- http://members.tsetmc.com/tsev2/excel/MarketWatchPlus.aspx?d=1396/02/02
- http://www.tsetmc.com/tsev2/data/MarketWatchInit.aspx?h=0&r=0

## Database Straucture
	create table instrument(
		instrument_id	 	bigint,
		instrument_code	 	bigint not null,
		company_name	 	varchar(255) not null,
		company_name_en		varchar(255) not null,
		symbol				varchar(255) not null,
		symbol_en			varchar(255) not null,
		ISIN				varchar(255) not null,
		CISIN				varchar(255) not null,
		tableau				varchar(255) not null,
		industry			varchar(255) not null,
		industry_code		varchar(255) not null,
		subindustry			varchar(255) not null,
		subindustry_code	varchar(255) not null,
		status				varchar(255) not null,
		status_code			varchar(255) not null,
		reasons				varchar(255) not null,
		description			varchar(255) not null
	)

	create table instrument_history(
		instrument_history_id	 	bigint,
		`instrument_code`	 		bigint not null,
		dt						int,
		cnt						int null,
		volume					bigint null,
		value					bigint null,
		price_yesterday			bigint null,
		open					bigint null,
		price_last_contract				bigint null,
		price_last_contract_change		bigint null,
		price_last_contract_percent		bigint null,
		price_last						bigint null,
		price_last_change				bigint null,
		price_last_percent				bigint null,
		low								bigint null,
		high							bigint null
	)
