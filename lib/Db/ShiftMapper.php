<?php
namespace OCA\ShiftsTutorial\Db;

use OCP\IDBConnection;
use OCP\AppFramework\Db\QBMapper;

/**
 * @extends QBMapper<Shift>
 */
class ShiftMapper extends QBMapper {

    public function __construct(IDBConnection $db) {
        parent::__construct($db, 'helpershift_shift', Shift::class);
    }

    public function find(int $id, string $userId) {
        $qb = $this->db->getQueryBuilder();

        $qb->select('*')
             ->from($this->getTableName())
             ->where($qb->expr()->eq('id', $qb->createNamedParameter($id)))
             ->andWhere($qb->expr()->eq('user_id', $qb->createNamedParameter($userId)));

        return $this->findEntity($qb);
    }

    public function findAll(string $userId) {
        $qb = $this->db->getQueryBuilder();

        $qb->select('*')
           ->from($this->getTableName())
           ->where($qb->expr()->eq('user_id', $qb->createNamedParameter($userId)));

        return $this->findEntities($qb);
    }

}