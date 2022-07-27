<?php

namespace OCA\Helpershifts\AppInfo;

use OCP\AppFramework\App;

class Application extends App {
	public const APP_ID = 'helpershifts';

	public function __construct() {
		parent::__construct(self::APP_ID);
	}
}
