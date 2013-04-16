<!DOCTYPE html>
<html class="ui-mobile-rendering">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/>
    <title>OLX Mobile</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href='http://fonts.googleapis.com/css?family=Roboto:300' rel='stylesheet' type='text/css'>
    <link rel="stylesheet" href="css/arwen/arwen.css" />
    <link rel="stylesheet" href="http://code.jquery.com/mobile/1.3.0/jquery.mobile.structure-1.3.0.min.css">
    <link rel='stylesheet' href='css/swipe/style.css'/>
    <link rel='stylesheet' href='css/arwen/style-arwen.css'/>
    

    <script data-main="js/main" src="js/libs/require/require.js"></script>

</head>

<body>
    <div id="home" data-role="page">
        <div id="left-panel" data-role="panel"></div>

        <div id="header" data-role="header">

            <a id="cat-button" href="#left-panel" data-rel="panel"></a>
            <h1><a href="#"><div>&nbsp;</div></a></h1>
            <a href="javascript:;" id="toggle-search"></a>
            
            <div id="search-bar-div" style="display:none;">
                <input id="search-bar" type="search" name="search" value="" data-mini="true" data-theme="c" class="search-header"/>
            </div>

            <div class="headerBorder"></div>

            <div id="breadcrumb" style="display: none;">
                <h3 class="parent">
                    <a href="#category/1">For Sale</a>
                </h3>
                <h3 class="category">
                    <a href="#category/2">Dogs</a>
                </h3>
            </div>
        </div>

        <div id="content" data-role="content"></div>
    </div>
</body>
</html>
