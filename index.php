<?php
// Keep relative frontend assets correct when opening the project root.
header('Location: ' . rtrim(dirname($_SERVER['SCRIPT_NAME']), '/') . '/frontend/index.html');
exit;
