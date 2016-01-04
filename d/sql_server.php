<?php
if (@$_GET['connect']) {
// Connecting to and selecting a MySQL database named sakila
// Hostname: 127.0.0.1, username: your_user, password: your_pass, db: sakila
    $mysqli = new mysqli($_GET['host'], $_GET['user'], $_GET['pass'], $_GET['db']);

// Oh no! A connect_errno exists so the connection attempt failed!
    if ($mysqli->connect_errno) {
        // The connection failed. What do you want to do?
        // You could contact yourself (email?), log the error, show a nice page, etc.
        // You do not want to reveal sensitive information

        // Let's try this:
        //echo "Sorry, this website is experiencing problems.";

        // Something you should not do on a public site, but this example will show you
        // anyways, is print out MySQL error related information -- you might log this
        //echo "Error: Failed to make a MySQL connection, here is why: \n";
        //echo "Errno: " . $mysqli->connect_errno . "\n";
        //echo "Error: " . $mysqli->connect_error . "\n";

        // You might want to show them something nice, but we will simply exit
        exit;
    }

// Perform an SQL query
    $sql = empty($_GET['query']) ? "show tables" : $_GET['query'];
    if (!($result = $mysqli->query($sql))) {
        // Oh no! The query failed.
        //echo "Sorry, the website is experiencing problems.";

        // Again, do not do this on a public site, but we'll show you how
        // to get the error information
        //echo "Error: Our query failed to execute and here is why: \n";
        //echo "Query: " . $sql . "\n";
        //echo "Errno: " . $mysqli->errno . "\n";
        //echo "Error: " . $mysqli->error . "\n";
        $tablesList = "query failed with query $sql with error no $mysqli->errno with error message $mysqli->error";
    } else {
// Phew, we made it. We know our MySQL connection and query
// succeeded, but do we have a result?
        if (@$result->num_rows === 0) {
            // Oh, no rows! Sometimes that's expected and okay, sometimes
            // it is not. You decide. In this case, maybe actor_id was too
            // large?
            $tablesList = "No tables in selected database";
        } else {
// Now, we know only one result will exist in this example so let's
// fetch it into an associated array where the array's keys are the
// table's column names
            while ($x = $result->fetch_object()) {
                $tablesList[] = $x;
            }
            if (count($tablesList) == 1) {
                $tablesList = $tablesList[0];
            }
        }
// The script will automatically free the result and close the MySQL
// connection when it exits, but let's just do it anyways
        $result->free();
    }
    $mysqli->close();
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
    <form action="index1.php" method="get" id="main">
        <input type="hidden" name="connect" value="true">

        <p>Host</p><input type="text" name="host"
                          value="<?php echo empty($_GET['host']) ? 'localhost' : $_GET['host']; ?>">

        <p>User</p><input type="text" name="user" value="<?php echo empty($_GET['user']) ? 'root' : $_GET['user']; ?>">

        <p>Password</p><input type="text" name="pass" value="<?php echo empty($_GET['pass']) ? '' : $_GET['pass']; ?>">

        <p>Database</p><input type="text" name="db" value="<?php echo empty($_GET['db']) ? 'test' : $_GET['db']; ?>">

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
                                    echo $value;
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
                                    <td><?php echo $value; ?></td>
                                <?php
                                }
                            } else {
                                for ($j = 0; $j < count($tablesList[$i]); $j++) {
                                    ?>
                                    <td><?php echo $tablesList[$i][$j]; ?></td>
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

<?php

$serverName = "(local)\sqlexpress";
$serverName = "(local)";
$serverName = "localhost\sqlexpress, 1433";
$connectionOptions = array(
    "WSID" => 'localhost',
    "UID" => 'sa',
    "PWD" => 'system',
    "Database" => "test");

/* Connect using Windows Authentication. */
$conn = sqlsrv_connect($serverName, $connectionOptions);
if ($conn === false) {
    echo "Unable to connect.</br>";
    die(var_dump(sqlsrv_errors(), true));
}


/* Query SQL Server for the login of the user accessing the
database. */
$tsql = "SELECT CONVERT(varchar(32), SUSER_SNAME())";
$tsql = "SELECT * from users";
$stmt = sqlsrv_query($conn, $tsql);
if ($stmt === false) {
    echo "Error in executing query.</br>";
    die(print_r(sqlsrv_errors(), true));
}

/* Retrieve and display the results of the query. */
$row = sqlsrv_fetch_array($stmt);
echo "User login: " . $row[0] . "</br>";

/* Free statement and connection resources. */
sqlsrv_free_stmt($stmt);
sqlsrv_close($conn);

?>