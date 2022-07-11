<?php
 namespace OCA\Helpershifts\Controller;

 use Exception;

 use OCP\IRequest;
 use OCP\AppFramework\Http;
 use OCP\AppFramework\Http\DataResponse;
 use OCP\AppFramework\Controller;

 use OCA\Helpershifts\Db\Shift;
 use OCA\Helpershifts\Db\ShiftMapper;

 class ShiftsController extends Controller {

     private $mapper;
     private $userId;

     public function __construct(string $AppName, IRequest $request, NoteMapper $mapper, $UserId){
         parent::__construct($AppName, $request);
         $this->mapper = $mapper;
         $this->userId = $UserId;
     }

     /**
      * @NoAdminRequired
      */
     public function index() {
         return new DataResponse($this->mapper->findAll($this->userId));
     }

     /**
      * @NoAdminRequired
      *
      * @param int $id
      */
     public function show(int $id) {
         try {
             return new DataResponse($this->mapper->find($id, $this->userId));
         } catch(Exception $e) {
             return new DataResponse([], Http::STATUS_NOT_FOUND);
         }
     }

     /**
      *
      * @param string $title
      * @param date $start
      * @param date $end
      * @param string $comment
      */
     public function create(string $title, DateTime start, DateTime end, string $comment, int userId) {
         $shift = new Shift();
         $shift->setTitle($title);
         $shift->setStart($start);
         $shift->setEnd($end);
         $shift->setComment($comment);
         $shift->setUserId($userId);
         $shift->setCreatedOn(new DateTime().getTimestamp());
         $shift->setCreatedBy($this->userId);
         return new DataResponse($this->mapper->insert($shift));
     }

     /**
      * @NoAdminRequired
      *
      * @param int $id
      * @param string $title
      * @param date $start
      * @param date $end
      * @param string $comment
      */
     public function update(int $id, string $title, date start, date end, string $comment, int user) {
         try {
             $shift = $this->mapper->find($id, $this->userId);
         } catch(Exception $e) {
             return new DataResponse([], Http::STATUS_NOT_FOUND);
         }
         $shift->setTitle($title);
         $shift->setStart($start);
         $shift->setEnd($end);
         $shift->setComment($comment);
         $shift->setUserId($userId);
         $shift->setUpdatedOn(new DateTime().getTimestamp());
         $shift->setUpdatedBy($this->userId);
         return new DataResponse($this->mapper->update($shift));
     }

     /**
      * @NoAdminRequired
      *
      * @param int $id
      */
     public function destroy(int $id) {
         try {
             $shift = $this->mapper->find($id, $this->userId);
         } catch(Exception $e) {
             return new DataResponse([], Http::STATUS_NOT_FOUND);
         }
         $this->mapper->delete($shift);
         return new DataResponse($shift);
     }

 }