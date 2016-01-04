<?php
if (@$_GET['connect']) {
    $serverName = $_GET['host'] . "\sqlexpress, " . $_GET['port'];
    $connectionOptions = array(
        "WSID" => $_GET['host'],
        "UID" => $_GET['user'],
        "PWD" => $_GET['pass'],
        "Database" => $_GET['db']);
    $conn = sqlsrv_connect($serverName, $connectionOptions);
    if ($conn === false) {
        echo "Unable to connect to database";
        die(var_dump(sqlsrv_errors(), true));
    }
// Perform an SQL query
    $sql = empty($_GET['query']) ? "SELECT * FROM sys.tables t INNER JOIN sys.objects o on o.object_id = t.object_id WHERE o.is_ms_shipped = 0" : $_GET['query'];
    if (!($result = sqlsrv_query($conn, $sql))) {
        $tablesList = json_encode(sqlsrv_errors());
    } else {
        if (sqlsrv_num_rows($result) === 0) {
            $tablesList = "No tables in selected database";
        } else {
            $tablesList = [];
            while ($x = sqlsrv_fetch_object($result)) {
                $tablesList[] = $x;
            }
            if (count($tablesList) == 1) {
                $tablesList = $tablesList[0];
            }else if(count($tablesList) == 0){
                $tablesList = null;
            }
        }
        sqlsrv_free_stmt($result);
    }
    sqlsrv_close($conn);
}
?>
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            * {
                margin: 0;
            }

            body {
                font-family: Tahoma;
                margin: 0;
                font-size: 12px;
            }

            .tablesList {
                width: 100%;
                margin-top: 30px;
            }

            table {
                border: 2px solid #1ABC9C;
                border: 2px solid #9B59B6;
                border-collapse: collapse;
                width: 100%;
            }

            thead {
                background: #1ABC9C;
                background: #9B59B6;
            }

            thead {
                color: white;
            }

            thead tr th {
                border-left: 1px solid #ffffff;
            }

            th, td {
                text-align: center;
                padding: 5px;
            }

            tbody tr:nth-child(even) {
                background: #e5e5e5;
            }

            #main {
                margin: 20px auto;
                background-color: #f2f2f2;
                width: 300px;
                border: 1px solid rgba(0, 0, 0, .2);
            }

            #main p {
                position: relative;
                clear: both;
                float: left;
                text-align: right;
                width: 80px;
                line-height: 30px;
                margin: 5px 0;
                color: #222;
                text-transform: uppercase;
                font-family: Verdana;
                font-size: 11px;
                padding-right: 5px;
            }

            #main input[type=text], #main textarea {
                width: 150px;
                border: 1px solid rgba(0, 0, 0, .15);
                background-color: rgba(0, 0, 0, .02);
                margin: 5px 0;
                padding: 0;
                padding-left: 5px;
                color: #844a9e;
                font-weight: bold;
                text-transform: uppercase;
                font-family: Arial, Helvetica, sans-serif;
            }

            #main input[type=text]:focus, #main textarea:focus {
                background-color: #ffffff;
            }

            input[type=text] {
                line-height: 30px;
                height: 30px;
            }

            textarea {
                line-height: 30px;
                height: 100px;
                resize: vertical;
            }

            #submit {
                width: 150px;
                margin: 5px auto;
                display: block;
                background-color: #9B59B6;
                color: #F8ECBC;
                font-weight: bold;
                border: 1px solid #f7f7f7;
                line-height: 30px;
                text-transform: capitalize;
                border-radius: 30px;
                cursor: pointer;
            }

            #submit:hover {
                background-color: #f30;
                color: #ffffff;
            }

            .error {
                text-align: center;
                font-size: 18px;
                line-height: 30px;
                color: #f30;
                background-color: #F8ECBC;
                width: 300px;
                border: 1px solid rgba(0, 0, 0, .2);
                margin: auto;
            }
        </style>
    </head>
    <body>
    <form action="index.php" method="get" id="main">
        <input type="hidden" name="connect" value="true">

        <p>Host</p><input type="text" name="host"
                          value="<?php echo empty($_GET['host']) ? 'localhost' : $_GET['host']; ?>">

        <p>User</p><input type="text" name="user" value="<?php echo empty($_GET['user']) ? 'sa' : $_GET['user']; ?>">

        <p>Password</p><input type="text" name="pass" value="<?php echo empty($_GET['pass']) ? 'system' : $_GET['pass']; ?>">

        <p>Database</p><input type="text" name="db" value="<?php echo empty($_GET['db']) ? 'test' : $_GET['db']; ?>">

        <p>Port</p><input type="text" name="port" value="<?php echo empty($_GET['port']) ? '1433' : $_GET['port']; ?>">

        <p>Query</p>
        <textarea name="query"><?php echo empty($_GET['query']) ? '' : $_GET['query']; ?></textarea>
        <input id="submit" type="submit" value="connect">
    </form>
    <?php if (@$_GET['connect']) { ?>
        <div class="tablesList">
            <table border="1" style="border-collapse: collapse">
                <thead>
                <tr>
                    <?php if (gettype($tablesList) == 'object') {
                        foreach ($tablesList as $h => $hv) {
                            ?>
                            <th><?php echo $h; ?></th>
                        <?php
                        }
                    } elseif (gettype($tablesList) == 'array') {
                        foreach ($tablesList[0] as $h => $hv) {
                            ?>
                            <th><?php echo $h; ?></th>
                        <?php
                        }
                    }
                    ?>
                </tr>
                </thead>
                <?php
                if (gettype($tablesList) == 'object') {
                    ?>
                    <tr>
                        <?php
                        foreach ($tablesList as $key => $value) {
                            ?>
                            <td><?php
                                if (gettype($value) == 'array') {
                                    var_dump($value);
                                    for ($i = 0; $i < count($value); $i++) {
                                        //echo $value[$i].'<br />';
                                    }
                                } else {
                                    switch(gettype($value)){
                                        case 'string' :
                                        case 'integer' :
                                        case 'NULL' :
                                            echo $value;
                                            break;
                                        case 'object' :
                                            var_dump($value);
                                            break;
                                        default:
                                            var_dump($value);
                                            break;
                                    }
                                }

                                ?></td>
                        <?php
                        }
                        ?>

                    </tr>
                <?php
                } else if (gettype($tablesList) == 'array') {
                    for ($i = 0; $i < count($tablesList); $i++) {
                        ?>
                        <tr>
                            <?php
                            if (gettype($tablesList[$i]) == 'object') {
                                foreach ($tablesList[$i] as $key => $value) {
                                    ?>
                                    <!--<td><?php /*echo $key; */ ?></td>-->
                                    <td><?php
                                        switch(gettype($value)){
                                            case 'string' :
                                            case 'integer' :
                                            case 'NULL' :
                                                echo $value;
                                                break;
                                            case 'object' :
                                                var_dump($value);
                                                break;
                                            default:
                                                var_dump($value);
                                                break;
                                        }
                                        ?></td>
                                <?php
                                }
                            } else {
                                for ($j = 0; $j < count($tablesList[$i]); $j++) {
                                    ?>
                                    <td><?php
                                        switch(gettype($tablesList[$i][$j])){
                                            case 'string' :
                                            case 'integer' :
                                            case 'NULL' :
                                                echo $tablesList[$i][$j];
                                                break;
                                            case 'object' :
                                                var_dump($tablesList[$i][$j]);
                                                break;
                                            default:
                                                var_dump($tablesList[$i][$j]);
                                                break;
                                        }
                                        ?></td>
                                <?php
                                }
                            }
                            ?>
                        </tr>
                    <?php
                    }
                    ?>
                <?php } else { ?>
                    <h1 class="error">No rows to fetch</h1>
                <?php } ?>

            </table>
        </div>
    <?php } ?>
    </body>
    </html>