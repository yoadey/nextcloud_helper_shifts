<?php
 namespace OCA\Helpershifts\Controller;

 use Exception;

 use OCP\IRequest;
 use OCP\AppFramework\Http;
 use OCP\AppFramework\Http\DataResponse;
 use OCP\AppFramework\Controller;

 use OCA\Helpershifts\Db\Slots;
 use OCA\Helpershifts\Db\SlotsMapper;

 class SlotsController extends Controller {

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
         return new DataResponse($this->mapper->findAll());
     }

     /**
      * @NoAdminRequired
      *
      * @param int $id
      */
     public function show(int $id) {
         try {
             return new DataResponse($this->mapper->find($id));
         } catch(Exception $e) {
             return new DataResponse([], Http::STATUS_NOT_FOUND);
         }
     }

     /**
      * @NoAdminRequired
      *
      * @param string $title
      * @param date $start
      * @param date $end
      * @param string $comment
      */
     public function create(string $title, date start, date end, string $comment) {
         $slot = new Slot();
         $slot->setTitle($title);
         $slot->setStart($start);
         $slot->setEnd($end);
         $slot->setComment($comment);
         $slot->setCreatedOn(new DateTime().getTimestamp());
         $slot->setCreatedBy($this->userId);
         return new DataResponse($this->mapper->insert($slot));
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
     public function update(int $id, string $title, date start, date end, string $comment) {
         try {
             $slot = $this->mapper->find($id);
         } catch(Exception $e) {
             return new DataResponse([], Http::STATUS_NOT_FOUND);
         }
         $slot->setTitle($title);
         $slot->setStart($start);
         $slot->setEnd($end);
         $slot->setComment($comment);
         $slot->setUpdatedOn(new DateTime().getTimestamp());
         $slot->setUpdatedBy($this->userId);
         return new DataResponse($this->mapper->update($slot));
     }

     /**
      * @NoAdminRequired
      *
      * @param int $id
      */
     public function destroy(int $id) {
         try {
             $slot = $this->mapper->find($id);
         } catch(Exception $e) {
             return new DataResponse([], Http::STATUS_NOT_FOUND);
         }
         $this->mapper->delete($slot);
         return new DataResponse($slot);
     }

 }